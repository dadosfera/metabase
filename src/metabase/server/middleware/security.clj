(ns metabase.server.middleware.security
  "Ring middleware for adding security-related headers to API responses."
  (:require
   [clojure.java.io :as io]
   [clojure.string :as str]
   [java-time.api :as t]
   [metabase.analytics.snowplow :as snowplow]
   [metabase.config :as config]
   [metabase.models.setting :refer [defsetting]]
   [metabase.public-settings :as public-settings]
   [metabase.server.request.util :as request.u]
   [metabase.util.i18n :refer [deferred-tru]]
   [ring.util.codec :refer [base64-encode]])
  (:import
   (java.security MessageDigest SecureRandom)))

(set! *warn-on-reflection* true)

(defn- generate-nonce
  "Generates a random nonce of 10 characters to add to the `Content-Security-Policy` header so that only scripts and
   inline style elements with the same nonce will be allowed to run. The server generates a unique nonce value each
   time it sends a response. For more information see
   https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/style-src."
  []
  (let [chars         "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
        secure-random (SecureRandom.)]
    (apply str (repeatedly 10 #(get chars (.nextInt secure-random (count chars)))))))

(defonce ^:private ^:const inline-js-hashes
  (letfn [(file-hash [resource-filename]
            (base64-encode
             (.digest (doto (MessageDigest/getInstance "SHA-256")
                        (.update (.getBytes (slurp (io/resource resource-filename))))))))]
    (mapv file-hash [ ;; inline script in index.html that sets `MetabaseBootstrap` and the like
                     "frontend_client/inline_js/index_bootstrap.js"
                     ;; inline script in index.html that loads Google Analytics
                     "frontend_client/inline_js/index_ganalytics.js"
                     ;; inline script in init.html
                     "frontend_client/inline_js/init.js"])))

(defn- cache-prevention-headers
  "Headers that tell browsers not to cache a response."
  []
  {"Cache-Control" "max-age=0, no-cache, must-revalidate, proxy-revalidate"
   "Expires"        "Tue, 03 Jul 2001 06:00:00 GMT"
   "Last-Modified"  (t/format :rfc-1123-date-time (t/zoned-date-time))})

(defn- cache-far-future-headers
  "Headers that tell browsers to cache a static resource for a long time."
  []
  {"Cache-Control" "public, max-age=31536000"})

(def ^:private ^:const strict-transport-security-header
  "Tell browsers to only access this resource over HTTPS for the next year (prevent MTM attacks). (This only applies if
  the original request was HTTPS; if sent in response to an HTTP request, this is simply ignored)"
  {"Strict-Transport-Security" "max-age=31536000"})

(defn- content-security-policy-header
  "`Content-Security-Policy` header. See https://content-security-policy.com for more details."
  [nonce]
  {"Content-Security-Policy"
   (str/join
    (for [[k vs] {:default-src  ["'none'"]
                  :script-src   (concat
                                  ["'self'"
                                   "https://maps.google.com"
                                   "https://accounts.google.com"
                                   (when (public-settings/anon-tracking-enabled)
                                     "https://www.google-analytics.com")
                                   ;; for webpack hot reloading
                                   (when config/is-dev?
                                     "http://localhost:8080")
                                   ;; for react dev tools to work in Firefox until resolution of
                                   ;; https://github.com/facebook/react/issues/17997
                                   (when config/is-dev?
                                     "'unsafe-inline'")]
                                  ;; CLJS REPL
                                  (when config/is-dev?
                                    ["'unsafe-eval'"
                                     "http://localhost:9630"])
                                 (when-not config/is-dev?
                                   (map (partial format "'sha256-%s'") inline-js-hashes)))
                  :child-src    ["'self'"
                                 ;; TODO - double check that we actually need this for Google Auth
                                 "https://accounts.google.com"]
                  :style-src    ["'self'"
                                 ;; See [[generate-nonce]]
                                 (when nonce
                                   (format "'nonce-%s'" nonce))
                                 ;; for webpack hot reloading
                                 (when config/is-dev?
                                   "http://localhost:8080")
                                 ;; CLJS REPL
                                 (when config/is-dev?
                                   "http://localhost:9630")
                                 "https://accounts.google.com"]
                  :font-src     ["*"]
                  :img-src      ["*"
                                 "'self' data:"]
                  :connect-src  ["'self'"
                                 ;; Mixpanel Api
                                 "https://api-js.mixpanel.com"
                                 ;; Google Identity Services
                                 "https://accounts.google.com"
                                 ;; MailChimp. So people can sign up for the Metabase mailing list in the sign up process
                                 "metabase.us10.list-manage.com"
                                 ;; Google analytics
                                 (when (public-settings/anon-tracking-enabled)
                                   "www.google-analytics.com")
                                 ;; Snowplow analytics
                                 (when (public-settings/anon-tracking-enabled)
                                   (snowplow/snowplow-url))
                                 ;; Webpack dev server
                                 (when config/is-dev?
                                   "*:8080 ws://*:8080")
                                 ;; CLJS REPL
                                 (when config/is-dev?
                                   "ws://*:9630")]
                  :manifest-src ["'self'"]}]
      (format "%s %s; " (name k) (str/join " " vs))))})

(defn- embedding-app-origin
  []
  (when (and (public-settings/enable-embedding) (public-settings/embedding-app-origin))
    (public-settings/embedding-app-origin)))

(defn- content-security-policy-header-with-frame-ancestors
  [allow-iframes? nonce]
  (update (content-security-policy-header nonce)
          "Content-Security-Policy"
          #(format "%s frame-ancestors %s;" % (if allow-iframes? "*" (or (embedding-app-origin) "'none'")))))

(defsetting ssl-certificate-public-key
  (deferred-tru
    (str "Base-64 encoded public key for this site''s SSL certificate. "
         "Specify this to enable HTTP Public Key Pinning. "
         "See {0} for more information.")
    "http://mzl.la/1EnfqBf")
  :audit :getter)
;; TODO - it would be nice if we could make this a proper link in the UI; consider enabling markdown parsing

(defn- first-embedding-app-origin
  "Return only the first embedding app origin."
  []
  (some-> (embedding-app-origin)
          (str/split #" ")
          first))

(defn security-headers
  "Fetch a map of security headers that should be added to a response based on the passed options."
  [& {:keys [nonce allow-iframes? allow-cache?]
      :or   {allow-iframes? false, allow-cache? false}}]
  (merge
   (if allow-cache?
     (cache-far-future-headers)
     (cache-prevention-headers))
   strict-transport-security-header
   (content-security-policy-header-with-frame-ancestors allow-iframes? nonce)
   (when-not allow-iframes?
     ;; Tell browsers not to render our site as an iframe (prevent clickjacking)
     {"X-Frame-Options"                 (if (embedding-app-origin)
                                          (format "ALLOW-FROM %s" (first-embedding-app-origin))
                                          "DENY")})
   { ;; Tell browser to block suspected XSS attacks
    "X-XSS-Protection"                  "1; mode=block"
    ;; Prevent Flash / PDF files from including content from site.
    "X-Permitted-Cross-Domain-Policies" "none"
    ;; Tell browser not to use MIME sniffing to guess types of files -- protect against MIME type confusion attacks
    "X-Content-Type-Options"            "nosniff"}))

(defn- add-security-headers* [request response]
  (update response :headers merge (security-headers
                                   :nonce          (:nonce request)
                                   :allow-iframes? ((some-fn request.u/public? request.u/embed?) request)
                                   :allow-cache?   (request.u/cacheable? request))))

(defn add-security-headers
  "Middleware that adds HTTP security and cache-busting headers."
  [handler]
  (fn [request respond raise]
    (let [request (assoc request :nonce (generate-nonce))]
      (handler
       request
       (comp respond (partial add-security-headers* request))
       raise))))
