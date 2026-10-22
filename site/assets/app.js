(function () {
  "use strict";

  var data = window.LUMAFORM || { links: {}, clips: [] };
  var links = data.links || {};
  var LABELS = { bg: "Backgrounds", ov: "Overlays", tr: "Transitions & packs", el: "Elements", ce: "Celebrations", te: "Tech & UI", re: "Retro" };
  var ORDER = ["bg", "ov", "tr", "el", "ce", "te", "re"];

  var clips = data.clips.map(function (c) {
    return { id: c[0], title: c[1], desc: c[2], tags: c[3].split(" "), loop: c[4], vertical: c[5] === "v" };
  });

  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var saveData = navigator.connection && navigator.connection.saveData;
  var autoplay = !reduceMotion && !saveData;

  function make(tag, attrs, text) {
    var node = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) { node.setAttribute(k, attrs[k]); });
    if (text != null) node.textContent = text;
    return node;
  }

  function play(video) {
    if (!video.getAttribute("src")) video.setAttribute("src", video.dataset.src);
    var p = video.play();
    if (p && p.catch) p.catch(function () {});
  }

  document.getElementById("clip-count").textContent = clips.length;
  document.getElementById("year").textContent = new Date().getFullYear();

  // Cards
  var grid = document.getElementById("grid");
  var cards = clips.map(function (c) {
    var card = make("figure", { "class": "card", tabindex: "0", role: "button", "aria-label": c.title + ": open preview", "data-tags": c.tags.join(" ") });
    var frame = make("div", { "class": "frame" + (c.vertical ? " vertical" : "") });
    var video = make("video", { muted: "", loop: "", playsinline: "", preload: "none", "aria-hidden": "true" });
    video.muted = true;
    video.dataset.src = "media/" + c.id + ".mp4";
    video.dataset.poster = "media/" + c.id + ".jpg";
    frame.appendChild(video);
    frame.appendChild(make("span", { "class": "badge" }, c.loop ? "Seamless loop" : (c.tags.indexOf("tr") >= 0 ? "4K pack" : "4K")));
    var cap = make("figcaption");
    cap.appendChild(make("h3", null, c.title));
    cap.appendChild(make("p", null, c.tags.map(function (t) { return LABELS[t]; }).join(" · ")));
    card.appendChild(frame);
    card.appendChild(cap);
    card.addEventListener("click", function () { openViewer(c); });
    card.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openViewer(c); }
    });
    if (!autoplay) {
      card.addEventListener("mouseenter", function () { play(video); });
      card.addEventListener("mouseleave", function () { video.pause(); });
    }
    grid.appendChild(card);
    return card;
  });

  // Posters load a little before a card scrolls in; clips play only while half visible.
  if ("IntersectionObserver" in window) {
    var posterObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var v = e.target.querySelector("video");
        v.setAttribute("poster", v.dataset.poster);
        posterObserver.unobserve(e.target);
      });
    }, { rootMargin: "600px 0px" });
    var playObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        var v = e.target.querySelector("video");
        if (e.isIntersecting && autoplay) play(v); else v.pause();
      });
    }, { threshold: 0.5 });
    cards.forEach(function (card) { posterObserver.observe(card); playObserver.observe(card); });
  } else {
    cards.forEach(function (card) { var v = card.querySelector("video"); v.setAttribute("poster", v.dataset.poster); });
  }

  // Filters
  var chipBar = document.getElementById("chips");
  var used = ORDER.filter(function (t) { return clips.some(function (c) { return c.tags.indexOf(t) >= 0; }); });
  var chips = ["all"].concat(used).map(function (t) {
    var b = make("button", { type: "button", "class": "chip", "data-tag": t, "aria-pressed": t === "all" ? "true" : "false" }, t === "all" ? "All" : LABELS[t]);
    b.addEventListener("click", function () { setFilter(t); });
    chipBar.appendChild(b);
    return b;
  });
  function setFilter(tag) {
    chips.forEach(function (b) { b.setAttribute("aria-pressed", b.dataset.tag === tag ? "true" : "false"); });
    cards.forEach(function (card) {
      card.hidden = tag !== "all" && card.dataset.tags.split(" ").indexOf(tag) < 0;
      if (card.hidden) card.querySelector("video").pause();
    });
  }

  // Viewer
  var dlg = document.getElementById("viewer");
  var vv = document.getElementById("viewer-video");
  function licenseButtons(box) {
    box.innerHTML = "";
    if (links.shutterstock) box.appendChild(make("a", { "class": "btn btn-primary", href: links.shutterstock, target: "_blank", rel: "noopener" }, "License on Shutterstock"));
    if (links.adobe) box.appendChild(make("a", { "class": "btn", href: links.adobe, target: "_blank", rel: "noopener" }, "License on Adobe Stock"));
  }
  function openViewer(c) {
    document.getElementById("viewer-title").textContent = c.title;
    document.getElementById("viewer-desc").textContent = c.desc;
    document.getElementById("viewer-tags").textContent =
      c.tags.map(function (t) { return LABELS[t]; }).join(" · ") + (c.loop ? " · Seamless loop" : "") + " · 4K UHD master";
    licenseButtons(document.getElementById("viewer-links"));
    vv.setAttribute("poster", "media/" + c.id + ".jpg");
    vv.setAttribute("src", "media/" + c.id + ".mp4");
    if (typeof dlg.showModal === "function") dlg.showModal(); else dlg.setAttribute("open", "");
    var p = vv.play();
    if (p && p.catch) p.catch(function () {});
  }
  function closeViewer() {
    if (typeof dlg.close === "function") dlg.close(); else dlg.removeAttribute("open");
  }
  dlg.addEventListener("close", function () { vv.pause(); vv.removeAttribute("src"); vv.load(); });
  dlg.addEventListener("click", function (e) { if (e.target === dlg) closeViewer(); });
  dlg.querySelector(".close").addEventListener("click", closeViewer);

  // License and contact
  var lic = document.getElementById("license-cards");
  var offers = [];
  if (links.shutterstock) offers.push(["Shutterstock", "Browse and license the Lumaform portfolio.", links.shutterstock]);
  if (links.adobe) offers.push(["Adobe Stock", "License the same clips on Adobe Stock.", links.adobe]);
  offers.push(["Custom loops", "A loop in your brand colours, or a moving background for your website.", "#contact"]);
  offers.forEach(function (o) {
    var external = o[2].charAt(0) !== "#";
    var a = make("a", external ? { "class": "lcard", href: o[2], target: "_blank", rel: "noopener" } : { "class": "lcard", href: o[2] });
    a.appendChild(make("strong", null, o[0]));
    a.appendChild(make("span", null, o[1]));
    lic.appendChild(a);
  });

  var contact = document.getElementById("contact-links");
  if (links.email) contact.appendChild(make("a", { "class": "btn btn-primary", href: "mailto:" + links.email }, links.email));
  if (links.linkedin) contact.appendChild(make("a", { "class": "btn" + (links.email ? "" : " btn-primary"), href: links.linkedin, target: "_blank", rel: "noopener" }, "LinkedIn"));
  if (links.youtube) contact.appendChild(make("a", { "class": "btn", href: links.youtube, target: "_blank", rel: "noopener" }, "YouTube"));
  if (links.website) contact.appendChild(make("a", { "class": "btn", href: links.website, target: "_blank", rel: "noopener" }, "Nabeel's website"));

  // Contact form: a Netlify form, sent in the background so the visitor stays on the page.
  // Without JavaScript it still posts normally and Netlify shows its own thank-you page.
  var form = document.getElementById("contact-form");
  var status = document.getElementById("form-status");
  if (form && window.fetch && window.URLSearchParams && window.FormData) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var button = form.querySelector("button[type=submit]");
      button.disabled = true;
      status.className = "form-status";
      status.textContent = "Sending...";
      fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(new FormData(form)).toString()
      }).then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        form.reset();
        form.hidden = true;
        status.className = "form-status ok";
        status.textContent = "Thanks, your message was sent. Nabeel will reply by email.";
      }).catch(function () {
        button.disabled = false;
        status.className = "form-status err";
        status.textContent = "Sorry, the message didn't send." + (links.email ? " Please email " + links.email + " instead." : " Please try again.");
      });
    });
  }
})();
