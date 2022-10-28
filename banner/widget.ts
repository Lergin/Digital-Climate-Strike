const MS_PER_DAY = 86400000;

interface Window {
  DIGITAL_CLIMATE_STRIKE_OPTIONS: Partial<BannerOptions>;
  showDigitalClimateStrikeBanner: (
    options: Partial<BannerOptions> | null
  ) => void;
}

type BannerOptions = {
  iframeHost: string;
  domId: string;
  alwaysShowBanner: boolean;
  showBannerOnLoad: boolean;
  cookieName: string;
  cookieExpirationDays: number;
  style: "quadratic" | "vertical";
  position:
    | "header"
    | "footer"
    | "top_left"
    | "top_right"
    | "bottom_left"
    | "bottom_right";
};

const DEFAULT_BANNER_OPTIONS: BannerOptions = {
  iframeHost: "https://fridaysforfuture.de/allefuer1komma5/",
  domId: "FRIDAYS_FOR_FUTURE_BANNER",
  cookieName: "_FRIDAYS_FOR_FUTURE_BANNER_CLOSED_",
  alwaysShowBanner: false,
  showBannerOnLoad: true,
  cookieExpirationDays: 1,
  style: "vertical",
  position: "header",
};

function validateOptions(options: BannerOptions) {
  if (options.style !== "vertical" && options.style !== "quadratic")
    throw new Error(
      "Unknown banner style, possible styles: 'vertical', 'quadratic'"
    );
  if (
    options.style === "vertical" &&
    options.position !== "header" &&
    options.position !== "footer"
  ) {
    throw new Error(
      "Unknown banner position for vertical, possible positions: 'header', 'footer'"
    );
  }

  if (
    options.style === "quadratic" &&
    options.position !== "top_left" &&
    options.position !== "top_right" &&
    options.position !== "bottom_left" &&
    options.position !== "bottom_right"
  ) {
    throw new Error(
      "Unknown banner position for quadratic, possible positions: 'top_left', 'top_right', 'bottom_left', 'bottom_right'"
    );
  }
}

function getIframeSrc(options: BannerOptions) {
  const urlParams: URLSearchParams = new URLSearchParams();
  urlParams.set("hostname", window.location.host);
  urlParams.set("bannerStyle", options.style);
  urlParams.set("bannerPosition", options.position);

  return `${options.iframeHost}banner/${
    options.style
  }/index.html?${urlParams.toString()}`;
}

function createIframe(options: BannerOptions) {
  const wrapper = document.createElement("div");
  wrapper.className += " " + options.domId;
  wrapper.className += " " + options.domId + "_" + options.style;
  wrapper.className += " " + options.domId + "_" + options.position;
  const iframe = document.createElement("iframe");
  iframe.src = getIframeSrc(options);
  iframe.frameBorder = "0";
  (iframe as any).allowTransparency = true;
  wrapper.appendChild(iframe);
  document.body.appendChild(wrapper);
  iframe.contentWindow.focus();
  return iframe;
}

function setCookie(name: string, value: string, expirationDays: number) {
  var d = new Date();
  d.setTime(d.getTime() + expirationDays * MS_PER_DAY);

  var expires = "expires=" + d.toUTCString();
  document.cookie = name + "=" + value + "; " + expires + "; path=/";
}

function getCookie(cookieName: string) {
  var name = cookieName + "=";
  var ca = document.cookie.split(";");
  var c: string;

  for (var i = 0; i < ca.length; i++) {
    c = ca[i].trim();
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }

  return "";
}

function injectCSS(id: string, css: string) {
  var style = document.createElement("style");
  style.id = id;
  if ((style as any).styleSheet) {
    (style as any).styleSheet.cssText = css;
  } else {
    style.appendChild(document.createTextNode(css));
  }
  document.head.appendChild(style);
}

function shouldBannerBeShown(options: BannerOptions) {
  if (options.alwaysShowBanner) return true;

  return getCookie(options.cookieName) !== "true";
}

function closeBanner(options: BannerOptions) {
  if (document.getElementsByClassName(options.domId).length !== 0) {
    document.getElementsByClassName(options.domId)[0].remove();
  }
}

function setBannerClosedCookie(options: BannerOptions) {
  setCookie(options.cookieName, "true", options.cookieExpirationDays);
}

function getCss(options: BannerOptions) {
  return `
    iframe {
      width: 100%;
      height: 100%;
    }

    ${options.domId} {
      -webkit-overflow-scrolling: touch;
      overflow: hidden;
      height: inherit;
      z-index: 20000;
      position: fixed;
    }

    ${options.domId}_vertical {
      width: 100vw;
      height: calc(100vw / 1440 * 221);
    }

    ${options.domId}_quadratic {
      width: 300px;
      height: 300px;
    }

    ${options.domId}_footer {
      right: 0px;
      left: 0px;
      bottom: 0px;
    }

    ${options.domId}_header {
      right: 0px;
      left: 0px;
      top: 0px;
    }

    ${options.domId}_top_left {
      left: 0px;
      top: 0px;
    }

    ${options.domId}_top_right {
      right: 0px;
      top: 0px;
    }

    ${options.domId}_bottom_left {
      left: 0px;
      bottom: 0px;
    }

    ${options.domId}_bottom_right {
      right: 0px;
      bottom: 0px;
    }
  `;
}

function showBanner(options: BannerOptions) {
  if (!shouldBannerBeShown(options)) {
    return;
  }

  closeBanner(options);

  const iframe = createIframe(options);
  injectCSS("DIGITAL_STRIKE_CSS", getCss(options));

  function onReceiveMessage(event: MessageEvent<any>) {
    if (!event.data.FRIDAYS_FOR_FUTURE_BANNER) return;

    switch (event.data.action) {
      case "close":
        closeBanner(options);
        setBannerClosedCookie(options);
        window.removeEventListener("message", onReceiveMessage);
        break;
      case "loaded":
        if (iframe) {
          iframe.contentWindow.postMessage(
            {
              FRIDAYS_FOR_FUTURE_BANNER: true,
              action: "create_close_button",
            },
            "*"
          );
        }
        break;
    }
  }

  window.addEventListener("message", onReceiveMessage);
}

function initializeBanner() {
  const options = {
    ...DEFAULT_BANNER_OPTIONS,
    ...window.DIGITAL_CLIMATE_STRIKE_OPTIONS
  };

  validateOptions(options);
  
  window.showDigitalClimateStrikeBanner = function (
    additonalOptions?: Partial<BannerOptions>
  ) {
    validateOptions({ ...options, ...additonalOptions });
    showBanner({ ...options, ...additonalOptions });
  };

  if (options.showBannerOnLoad) {
    switch (document.readyState) {
      case "complete":
      case "loaded" as any:
      case "interactive":
        showBanner(options);
        break;
      default:
        function onDomContentLoaded() {
          showBanner(options);
          document.removeEventListener("DOMContentLoaded", onDomContentLoaded);
        }
        document.addEventListener("DOMContentLoaded", onDomContentLoaded);
    }
  }
}

initializeBanner();
