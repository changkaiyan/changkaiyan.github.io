const ABOUT_LANGUAGE_STORAGE_KEY = "about-language";

const getPreferredAboutLanguage = function () {
  let savedLanguage = null;
  try {
    savedLanguage = window.localStorage.getItem(ABOUT_LANGUAGE_STORAGE_KEY);
  } catch (error) {
    savedLanguage = null;
  }

  if (savedLanguage === "en" || savedLanguage === "zh") {
    return savedLanguage;
  }

  const languages = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || navigator.userLanguage || "en"];
  return languages.some((language) => language && language.toLowerCase().startsWith("zh")) ? "zh" : "en";
};

const setAboutLanguage = function (language) {
  const normalizedLanguage = language === "zh" ? "zh" : "en";
  document.documentElement.setAttribute("data-about-lang", normalizedLanguage);
};

setAboutLanguage(getPreferredAboutLanguage());

$(document).ready(function () {
  const updateAboutLanguageControls = function (language) {
    const normalizedLanguage = language === "zh" ? "zh" : "en";
    $("[data-about-lang-option]").each(function () {
      const $button = $(this);
      $button.attr("aria-pressed", $button.data("about-lang-option") === normalizedLanguage ? "true" : "false");
    });

    $("[data-about-label-en]").each(function () {
      const $element = $(this);
      const label =
        normalizedLanguage === "zh" ? $element.data("about-label-zh") || $element.data("about-label-en") : $element.data("about-label-en");
      $element.attr("data-label", label);
    });

    $(".honors-toggle").each(function () {
      const $button = $(this);
      const isExpanded = $button.attr("aria-expanded") === "true";
      const labelKey = isExpanded ? "hide-label" : "show-label";
      const label = normalizedLanguage === "zh" ? $button.data(labelKey + "-zh") || $button.data(labelKey) : $button.data(labelKey);
      $button.find("span").text(label);
    });
  };

  updateAboutLanguageControls(document.documentElement.getAttribute("data-about-lang"));

  $("[data-about-lang-option]").click(function () {
    const language = $(this).data("about-lang-option") === "zh" ? "zh" : "en";
    try {
      window.localStorage.setItem(ABOUT_LANGUAGE_STORAGE_KEY, language);
    } catch (error) {
      // Language switching should still work when storage is unavailable.
    }
    setAboutLanguage(language);
    updateAboutLanguageControls(language);
  });

  const togglePublicationPanel = function ($entry, panelClass) {
    const panelSelector = "." + panelClass + ".hidden";
    $entry.find(panelSelector).toggleClass("open");
    $entry.find(".hidden.open").not(panelSelector).toggleClass("open");

    const isOpen = $entry.find(panelSelector).hasClass("open");
    $entry.find(".abstract-trigger").attr("aria-expanded", isOpen ? "true" : "false");
  };

  // add toggle functionality to abstract, award and bibtex buttons
  $("a.abstract").click(function () {
    togglePublicationPanel($(this).closest(".bib-entry"), "abstract");
  });
  $(".abstract-trigger").click(function () {
    togglePublicationPanel($(this).closest(".bib-entry"), "abstract");
  });
  $("a.award").click(function () {
    togglePublicationPanel($(this).closest(".bib-entry"), "award");
  });
  $("a.bibtex").click(function () {
    togglePublicationPanel($(this).closest(".bib-entry"), "bibtex");
  });
  $(".honors-toggle").click(function () {
    const $button = $(this);
    const isExpanded = $button.attr("aria-expanded") === "true";
    const language = document.documentElement.getAttribute("data-about-lang") === "zh" ? "zh" : "en";
    const labelKey = isExpanded ? "show-label" : "hide-label";
    $(".honors-list .honor-extra").toggleClass("is-collapsed", isExpanded);
    $button.attr("aria-expanded", isExpanded ? "false" : "true");
    $button.find("span").text(language === "zh" ? $button.data(labelKey + "-zh") || $button.data(labelKey) : $button.data(labelKey));
  });
  $("a").removeClass("waves-effect waves-light");

  // bootstrap-toc
  if ($("#toc-sidebar").length) {
    // remove related publications years from the TOC
    $(".publications h2").each(function () {
      $(this).attr("data-toc-skip", "");
    });
    var navSelector = "#toc-sidebar";
    var $myNav = $(navSelector);
    Toc.init($myNav);
    $("body").scrollspy({
      target: navSelector,
      offset: 100,
    });
  }

  // add css to jupyter notebooks
  const cssLink = document.createElement("link");
  cssLink.href = "../css/jupyter.css";
  cssLink.rel = "stylesheet";
  cssLink.type = "text/css";

  let jupyterTheme = determineComputedTheme();

  $(".jupyter-notebook-iframe-container iframe").each(function () {
    $(this).contents().find("head").append(cssLink);

    if (jupyterTheme == "dark") {
      $(this).bind("load", function () {
        $(this).contents().find("body").attr({
          "data-jp-theme-light": "false",
          "data-jp-theme-name": "JupyterLab Dark",
        });
      });
    }
  });

  // trigger popovers
  $('[data-toggle="popover"]').popover({
    trigger: "hover",
  });
});
