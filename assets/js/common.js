$(document).ready(function () {
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
    $(".honors-list .honor-extra").toggleClass("is-collapsed", isExpanded);
    $button.attr("aria-expanded", isExpanded ? "false" : "true");
    $button.find("span").text(isExpanded ? $button.data("show-label") : $button.data("hide-label"));
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
