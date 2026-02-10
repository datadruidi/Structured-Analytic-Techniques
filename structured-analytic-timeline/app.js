(function () {
  "use strict";

  const STORAGE_KEY = "timeline-events";
  const INDICATORS_STORAGE_KEY = "indicators_store";
  const INDICATORS_ENTITIES = ["What", "Who", "When", "Where", "Why", "How"];
  const INDICATORS_PLACEHOLDERS = {
    What: "What kind of indicator could it be?",
    Who: "Who could cause the indicator?",
    When: "When would we see the indicator?",
    Where: "Where would we see the indicator?",
    Why: "Why is the indicator important?",
    How: "How would this indicator manifest / be observed?"
  };

  const form = document.getElementById("event-form");
  const nameInput = document.getElementById("event-name");
  const descInput = document.getElementById("event-description");
  const sourceInput = document.getElementById("event-source");
  const dateInput = document.getElementById("event-date");
  const timeInput = document.getElementById("event-time");
  const timelineHorizontal = document.getElementById("timeline-horizontal");
  const timelineCallouts = document.getElementById("timeline-callouts");
  const timelineLine = document.getElementById("timeline-line");
  const timelineLineBar = document.getElementById("timeline-line-bar");
  const axisStart = document.getElementById("axis-start");
  const axisEnd = document.getElementById("axis-end");
  const emptyEl = document.getElementById("timeline-empty");
  const timelineViewport = document.getElementById("timeline-viewport");
  const timelineWorld = document.getElementById("timeline-world");
  const zoomLabel = document.getElementById("zoom-label");
  const btnZoomOut = document.getElementById("btn-zoom-out");
  const btnZoomIn = document.getElementById("btn-zoom-in");
  const btnResetView = document.getElementById("btn-reset-view");
  const btnLayouts = document.getElementById("btn-layouts");
  const layoutsDropdown = document.getElementById("layouts-dropdown");
  const layoutsWrap = document.getElementById("layouts-wrap");
  const layoutsCheckAddEvent = document.getElementById("layouts-check-add-event");
  const layoutsCheckEvents = document.getElementById("layouts-check-events");
  const layoutsCheckDetails = document.getElementById("layouts-check-details");
  const layoutsToggleAddEvent = document.getElementById("layouts-toggle-add-event");
  const layoutsToggleEvents = document.getElementById("layouts-toggle-events");
  const layoutsToggleDetails = document.getElementById("layouts-toggle-details");
  const btnFileMenu = document.getElementById("btn-file-menu");
  const fileDropdown = document.getElementById("file-dropdown");
  const fileImportEvents = document.getElementById("file-import-events");
  const fileExportEvents = document.getElementById("file-export-events");
  const fileDownloadTemplate = document.getElementById("file-download-template");
  const fileRemoveAll = document.getElementById("file-remove-all");
  const jsonFileInput = document.getElementById("json-file-input");
  const btnHideAddEvent = document.getElementById("btn-hide-add-event");
  const btnHideEvents = document.getElementById("btn-hide-events");
  const btnHideDetails = document.getElementById("btn-hide-details");
  const errorName = document.getElementById("error-name");
  const errorDesc = document.getElementById("error-description");
  const errorSource = document.getElementById("error-source");
  const errorDate = document.getElementById("error-date");
  const errorTime = document.getElementById("error-time");
  const formTitle = document.getElementById("form-title");
  const btnSubmit = document.getElementById("btn-submit");
  const btnCancel = document.getElementById("btn-cancel");
  const eventDetailsContent = document.getElementById("event-details-content");
  const eventDetailsClose = document.getElementById("event-details-close");
  const eventsListEl = document.getElementById("events-list");
  const panelAddEvent = document.getElementById("panel-add-event");
  const panelEvents = document.getElementById("panel-events");
  const panelDetails = document.getElementById("panel-details");
  const timelineScalerOverview = document.getElementById("timeline-scaler-overview");
  const timelineScalerSelection = document.getElementById("timeline-scaler-selection");
  const scalerHandleLeft = document.getElementById("scaler-handle-left");
  const scalerHandleRight = document.getElementById("scaler-handle-right");
  const scalerRangeDisplay = document.getElementById("scaler-range-display");
  const scaleFirstDateInput = document.getElementById("scale-first-date");
  const scaleLastDateInput = document.getElementById("scale-last-date");
  const btnYearScaleApply = document.getElementById("btn-year-scale-apply");
  const timelineToolbar = document.getElementById("timeline-toolbar");
  const timelineToolbarResizeHandle = document.getElementById("timeline-toolbar-resize-handle");
  const btnIndicatorsToolbar = document.getElementById("btn-indicators-toolbar");
  const btnIndicatorsDetails = document.getElementById("btn-indicators-details");
  const indicatorsOverlay = document.getElementById("indicators-overlay");
  const indicatorsBackdrop = document.getElementById("indicators-backdrop");
  const indicatorsModal = document.getElementById("indicators-modal");
  const indicatorsModalClose = document.getElementById("indicators-modal-close");
  const indicatorsBtnCreate = document.getElementById("indicators-btn-create");
  const indicatorsBtnCancel = document.getElementById("indicators-btn-cancel");

  var editingId = null;
  var activeEventId = null;
  var timelinePanX = 0;
  var timelinePanY = 0;
  var timelineZoom = 1;
  var maxPanelZ = 100;
  var viewRange = null;
  var fullRange = null;
  var scaleRange = null;
  var scaleStartDate = null;
  var scaleEndDate = null;
  var lastVisibleEvents = [];

  const TOPBAR_HEIGHT = 100;
  const VIEW_RANGE_KEY = "ui.viewRange";
  const SCALE_DATES_KEY = "ui.scaleDates";
  const RESET_SCALE_START = "1939-01-01";
  const RESET_SCALE_END = "1945-12-31";
  const RESET_ZOOM = 0.75;
  const TOOLBAR_HEIGHT_KEY = "ui.toolbarHeight";
  const MIN_TOOLBAR_H = 48;
  const MAX_TOOLBAR_H = 200;
  const DEFAULT_TOOLBAR_H = 110;

  function loadToolbarHeight() {
    try {
      var raw = localStorage.getItem(TOOLBAR_HEIGHT_KEY);
      if (!raw) return null;
      var h = parseInt(raw, 10);
      if (!Number.isNaN(h) && h >= MIN_TOOLBAR_H && h <= MAX_TOOLBAR_H) return h;
      return null;
    } catch (_) {
      return null;
    }
  }

  function saveToolbarHeight(h) {
    if (typeof h === "number" && !Number.isNaN(h)) {
      localStorage.setItem(TOOLBAR_HEIGHT_KEY, String(Math.round(h)));
    }
  }

  function applyToolbarHeight(h) {
    if (!timelineToolbar) return;
    var clamped = Math.max(MIN_TOOLBAR_H, Math.min(MAX_TOOLBAR_H, h));
    timelineToolbar.style.height = clamped + "px";
  }

  function setupToolbarResize() {
    if (!timelineToolbarResizeHandle || !timelineToolbar) return;
    var startY = 0;
    var startHeight = 0;
    function onMove(e) {
      var deltaY = e.clientY - startY;
      var newHeight = Math.max(MIN_TOOLBAR_H, Math.min(MAX_TOOLBAR_H, startHeight + deltaY));
      timelineToolbar.style.height = newHeight + "px";
      saveToolbarHeight(newHeight);
    }
    function onUp(ev) {
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerup", onUp);
      document.removeEventListener("pointercancel", onUp);
      if (ev && timelineToolbarResizeHandle.releasePointerCapture) {
        try { timelineToolbarResizeHandle.releasePointerCapture(ev.pointerId); } catch (_) {}
      }
    }
    timelineToolbarResizeHandle.addEventListener("pointerdown", function (e) {
      e.preventDefault();
      startY = e.clientY;
      startHeight = timelineToolbar.offsetHeight;
      if (timelineToolbarResizeHandle.setPointerCapture) timelineToolbarResizeHandle.setPointerCapture(e.pointerId);
      document.addEventListener("pointermove", onMove);
      document.addEventListener("pointerup", onUp);
      document.addEventListener("pointercancel", onUp);
    });
  }

  function msToDateString(ms) {
    var d = new Date(ms);
    var y = d.getFullYear();
    var m = String(d.getMonth() + 1).padStart(2, "0");
    var day = String(d.getDate()).padStart(2, "0");
    return y + "-" + m + "-" + day;
  }

  function generateId() {
    return "evt-" + Date.now() + "-" + Math.random().toString(36).slice(2, 11);
  }

  function loadEvents() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (_) {
      return [];
    }
  }

  function saveEvents(events) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  }

  function clearFieldErrors() {
    [errorName, errorDesc, errorSource, errorDate, errorTime].forEach(function (el) {
      if (el) el.textContent = "";
    });
    [nameInput, descInput, sourceInput, dateInput, timeInput].forEach(function (el) {
      if (el) el.classList.remove("error-field");
    });
  }

  function setFieldError(fieldEl, errorEl, message) {
    errorEl.textContent = message;
    fieldEl.classList.add("error-field");
  }

  function validateForm() {
    clearFieldErrors();
    var valid = true;

    var name = typeof nameInput.value === "string" ? nameInput.value.trim() : "";
    var desc = typeof descInput.value === "string" ? descInput.value.trim() : "";
    var source = sourceInput ? (typeof sourceInput.value === "string" ? sourceInput.value.trim() : "") : "";
    var dateRaw = dateInput ? dateInput.value : "";
    var timeRaw = timeInput ? timeInput.value : "";

    if (!name) {
      setFieldError(nameInput, errorName, "Name is required.");
      valid = false;
    }
    if (!desc) {
      setFieldError(descInput, errorDesc, "Description is required.");
      valid = false;
    }

    var timeIso = null;
    if (!dateRaw || dateRaw.trim() === "") {
      if (errorDate) setFieldError(dateInput, errorDate, "Date is required.");
      valid = false;
    } else if (!timeRaw || timeRaw.trim() === "") {
      if (errorTime) setFieldError(timeInput, errorTime, "Time is required.");
      valid = false;
    } else {
      try {
        var combined = dateRaw.indexOf("T") >= 0 ? dateRaw : dateRaw + "T" + (timeRaw.length === 5 ? timeRaw + ":00" : timeRaw);
        var date = new Date(combined);
        if (Number.isNaN(date.getTime())) {
          if (errorDate) setFieldError(dateInput, errorDate, "Please enter a valid date and time.");
          valid = false;
        } else {
          timeIso = date.toISOString();
        }
      } catch (_) {
        if (errorDate) setFieldError(dateInput, errorDate, "Please enter a valid date and time.");
        valid = false;
      }
    }

    return valid ? { name: name, description: desc, source: source || undefined, time: timeIso } : null;
  }

  function isoToDatetimeLocal(isoString) {
    try {
      var d = new Date(isoString);
      if (Number.isNaN(d.getTime())) return "";
      var pad = function (n) { return n < 10 ? "0" + n : n; };
      return pad(d.getFullYear()) + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()) +
        "T" + pad(d.getHours()) + ":" + pad(d.getMinutes());
    } catch (_) {
      return "";
    }
  }

  function isoToDateInput(isoString) {
    try {
      var d = new Date(isoString);
      if (Number.isNaN(d.getTime())) return "";
      var pad = function (n) { return n < 10 ? "0" + n : n; };
      return pad(d.getFullYear()) + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
    } catch (_) {
      return "";
    }
  }

  function isoToTimeInput(isoString) {
    try {
      var d = new Date(isoString);
      if (Number.isNaN(d.getTime())) return "";
      var pad = function (n) { return n < 10 ? "0" + n : n; };
      return pad(d.getHours()) + ":" + pad(d.getMinutes());
    } catch (_) {
      return "";
    }
  }

  function formatDisplayTime(isoString) {
    try {
      var d = new Date(isoString);
      if (Number.isNaN(d.getTime())) return isoString;
      return d.toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short"
      });
    } catch (_) {
      return isoString;
    }
  }

  function formatAxisLabel(isoString) {
    try {
      var d = new Date(isoString);
      if (Number.isNaN(d.getTime())) return isoString;
      return d.toLocaleDateString(undefined, { month: "short", year: "numeric" });
    } catch (_) {
      return isoString;
    }
  }

  function getFullRange(events) {
    if (events.length === 0) return null;
    var minTs = Infinity;
    var maxTs = -Infinity;
    events.forEach(function (evt) {
      var t = new Date(evt.time || 0).getTime();
      if (!Number.isNaN(t)) {
        if (t < minTs) minTs = t;
        if (t > maxTs) maxTs = t;
      }
    });
    if (minTs === Infinity || maxTs === -Infinity) return null;
    return { minMs: minTs, maxMs: maxTs };
  }

  function parseDateString(dateStr) {
    var parts = (dateStr || "").trim().split("-");
    if (parts.length !== 3) return null;
    var y = parseInt(parts[0], 10);
    var m = parseInt(parts[1], 10) - 1;
    var d = parseInt(parts[2], 10);
    if (Number.isNaN(y) || Number.isNaN(m) || Number.isNaN(d)) return null;
    var date = new Date(y, m, d);
    if (date.getFullYear() !== y || date.getMonth() !== m || date.getDate() !== d) return null;
    return date;
  }

  function getScaleRangeFromDates(startDateStr, endDateStr) {
    if (!startDateStr || !endDateStr) return null;
    var startDate = parseDateString(startDateStr);
    var endDate = parseDateString(endDateStr);
    if (!startDate || !endDate || startDate > endDate) return null;
    var startMs = startDate.getTime();
    var endMs = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate(), 23, 59, 59, 999).getTime();
    return { startMs: startMs, endMs: endMs, minMs: startMs, maxMs: endMs };
  }

  function loadScaleDates() {
    try {
      var raw = localStorage.getItem(SCALE_DATES_KEY);
      if (raw) {
        var o = JSON.parse(raw);
        if (o && typeof o.startDate === "string" && typeof o.endDate === "string" && o.startDate <= o.endDate) return o;
      }
      var legacy = localStorage.getItem("ui.scaleYears");
      if (legacy) {
        var y = JSON.parse(legacy);
        if (y && typeof y.firstYear === "number" && typeof y.lastYear === "number" && y.firstYear <= y.lastYear) {
          return { startDate: y.firstYear + "-01-01", endDate: y.lastYear + "-12-31" };
        }
      }
      return null;
    } catch (_) {
      return null;
    }
  }

  function saveScaleDates(startDate, endDate) {
    if (typeof startDate === "string" && typeof endDate === "string") {
      localStorage.setItem(SCALE_DATES_KEY, JSON.stringify({ startDate: startDate, endDate: endDate }));
    } else {
      localStorage.removeItem(SCALE_DATES_KEY);
    }
  }

  function ensureScaleRange(fullEvents) {
    var saved = loadScaleDates();
    if (saved) {
      scaleStartDate = saved.startDate;
      scaleEndDate = saved.endDate;
      scaleRange = getScaleRangeFromDates(scaleStartDate, scaleEndDate);
      return;
    }
    var now = new Date();
    if (fullEvents && fullEvents.length > 0 && fullRange) {
      scaleStartDate = msToDateString(fullRange.minMs);
      scaleEndDate = msToDateString(fullRange.maxMs);
      scaleRange = getScaleRangeFromDates(scaleStartDate, scaleEndDate);
      saveScaleDates(scaleStartDate, scaleEndDate);
    } else {
      var from = new Date(now);
      from.setFullYear(from.getFullYear() - 5);
      var to = new Date(now);
      to.setFullYear(to.getFullYear() + 5);
      scaleStartDate = msToDateString(from.getTime());
      scaleEndDate = msToDateString(to.getTime());
      scaleRange = getScaleRangeFromDates(scaleStartDate, scaleEndDate);
      saveScaleDates(scaleStartDate, scaleEndDate);
    }
  }

  function syncScaleDateInputs() {
    if (scaleFirstDateInput) scaleFirstDateInput.value = scaleStartDate || "";
    if (scaleLastDateInput) scaleLastDateInput.value = scaleEndDate || "";
  }

  function loadViewRange() {
    try {
      var raw = localStorage.getItem(VIEW_RANGE_KEY);
      if (!raw) return null;
      var o = JSON.parse(raw);
      if (o && typeof o.startMs === "number" && typeof o.endMs === "number" && o.startMs < o.endMs) return o;
      return null;
    } catch (_) {
      return null;
    }
  }

  function saveViewRange(range) {
    if (range) localStorage.setItem(VIEW_RANGE_KEY, JSON.stringify({ startMs: range.startMs, endMs: range.endMs }));
    else localStorage.removeItem(VIEW_RANGE_KEY);
  }

  function renderTimeline() {
    var fullEvents = loadEvents();
    fullEvents.sort(function (a, b) {
      return (a.time || "").localeCompare(b.time || "");
    });

    fullRange = getFullRange(fullEvents);
    ensureScaleRange(fullEvents);
    syncScaleDateInputs();

    if (scaleRange) {
      var saved = loadViewRange();
      if (saved && saved.startMs < saved.endMs && saved.startMs < scaleRange.endMs && saved.endMs > scaleRange.startMs) {
        viewRange = {
          startMs: Math.max(scaleRange.startMs, saved.startMs),
          endMs: Math.min(scaleRange.endMs, saved.endMs)
        };
        if (viewRange.startMs >= viewRange.endMs) viewRange = { startMs: scaleRange.startMs, endMs: scaleRange.endMs };
      } else {
        viewRange = { startMs: scaleRange.startMs, endMs: scaleRange.endMs };
      }
      saveViewRange(viewRange);
    } else {
      viewRange = null;
    }

    if (fullEvents.length === 0) {
      lastVisibleEvents = [];
      if (emptyEl) emptyEl.hidden = false;
      if (timelineWorld) timelineWorld.hidden = true;
      renderEventsList([], 0);
      updateScalerUI();
      return;
    }

    if (emptyEl) emptyEl.hidden = true;
    if (timelineWorld) timelineWorld.hidden = false;

    var visibleEvents = viewRange
      ? fullEvents.filter(function (evt) {
          var t = new Date(evt.time || 0).getTime();
          return !Number.isNaN(t) && t >= viewRange.startMs && t <= viewRange.endMs;
        })
      : fullEvents.slice();

    var range = viewRange
      ? { min: viewRange.startMs, max: viewRange.endMs }
      : fullRange
        ? { min: fullRange.minMs, max: fullRange.maxMs }
        : null;
    if (!range) {
      timelineCallouts.innerHTML = "";
      timelineLineBar.innerHTML = "";
      lastVisibleEvents = [];
      renderEventsList([], fullEvents.length);
      updateScalerUI();
      return;
    }

    axisStart.textContent = formatAxisLabel(new Date(range.min).toISOString());
    axisEnd.textContent = formatAxisLabel(new Date(range.max).toISOString());

    var total = range.max - range.min;
    var CARD_WIDTH_PX = 260;
    var GAP_PCT = 2;
    var BASE_OFFSET_PX = 20;
    var LANE_HEIGHT_PX = 130;
    var containerWidth = timelineCallouts.offsetWidth || 600;
    var cardWidthPct = (CARD_WIDTH_PX / containerWidth) * 100;
    var halfWidth = cardWidthPct / 2 + GAP_PCT / 2;

    var items = [];
    visibleEvents.forEach(function (evt) {
      var t = new Date(evt.time || 0).getTime();
      if (Number.isNaN(t)) return;
      var pct = total > 0 ? ((t - range.min) / total) * 100 : 50;
      pct = Math.max(0, Math.min(100, pct));
      items.push({ evt: evt, pct: pct, time: t });
    });
    items.sort(function (a, b) { return a.time - b.time; });

    items.forEach(function (item, idx) {
      item.displayIndex = idx + 1;
      item.side = idx % 2 === 0 ? "above" : "below";
    });

    var upperLanes = [];
    var lowerLanes = [];
    
    function overlaps(aLeft, aRight, bLeft, bRight) {
      return aLeft < bRight && bLeft < aRight;
    }
    
    items.forEach(function (item) {
      var left = item.pct - halfWidth;
      var right = item.pct + halfWidth;
      var lanes = item.side === "above" ? upperLanes : lowerLanes;
      var lane = 0;
      
      while (lane < lanes.length) {
        var conflict = lanes[lane].some(function (prev) {
          return overlaps(left, right, prev.left, prev.right);
        });
        if (!conflict) break;
        lane++;
      }
      
      if (lane >= lanes.length) lanes.push([]);
      lanes[lane].push({ left: left, right: right });
      item.lane = lane;
    });

    timelineCallouts.innerHTML = "";
    timelineLineBar.innerHTML = "";

    items.forEach(function (item) {
      var evt = item.evt;
      var pct = item.pct;
      var lane = item.lane;
      var side = item.side;
      var dragOffset = evt.dragOffset || { x: 0, y: 0 };
      
      var offsetPx = BASE_OFFSET_PX + (lane * LANE_HEIGHT_PX);

      var calloutMarker = document.createElement("div");
      calloutMarker.className = "timeline-event-marker timeline-event-callout";
      calloutMarker.setAttribute("data-id", evt.id);
      calloutMarker.setAttribute("data-side", side);
      calloutMarker.style.left = pct + "%";
      
      if (side === "above") {
        calloutMarker.style.bottom = "50%";
        calloutMarker.style.marginBottom = offsetPx + "px";
        calloutMarker.style.top = "auto";
      } else {
        calloutMarker.style.top = "50%";
        calloutMarker.style.marginTop = offsetPx + "px";
        calloutMarker.style.bottom = "auto";
      }

      var displayIndex = item.displayIndex;
      var hasSource = evt.source && String(evt.source).trim();
      var menuItems =
        '<button type="button" class="dropdown-item btn-edit" data-id="' + escapeHtml(evt.id) + '" role="menuitem">Edit</button>' +
        (hasSource ? '<button type="button" class="dropdown-item btn-view-source" data-id="' + escapeHtml(evt.id) + '" role="menuitem">View Source</button>' : '') +
        '<button type="button" class="dropdown-item btn-delete" data-id="' + escapeHtml(evt.id) + '" role="menuitem">Delete</button>';
      var pillDateStr = formatPillDate(evt.time || "");
      calloutMarker.innerHTML =
        '<div class="callout">' +
        '<div class="callout-box draggable-callout" data-id="' + escapeHtml(evt.id) + '" style="transform: translate(' + (dragOffset.x || 0) + 'px, ' + (dragOffset.y || 0) + 'px) scale(var(--uiScale, 1))">' +
        '<div class="pill-inner">' +
        '<div class="callout-header">' +
        '<span class="event-index-badge">' + displayIndex + "</span>" +
        '<span class="event-name-wrap event-name-clickable" data-id="' + escapeHtml(evt.id) + '" role="button" tabindex="0"><p class="event-name">' + escapeHtml(evt.name || "") + "</p></span>" +
        '<div class="callout-dropdown">' +
        '<button type="button" class="dropdown-trigger" title="Actions" aria-expanded="false" aria-haspopup="true">⋮</button>' +
        '<div class="dropdown-menu" role="menu" hidden>' +
        menuItems +
        "</div></div></div>" +
        '<div class="pill-date">' + escapeHtml(pillDateStr) + "</div>" +
        "</div></div>" +
        "</div></div>";

      timelineCallouts.appendChild(calloutMarker);

      var dot = document.createElement("div");
      dot.className = "marker-dot";
      dot.setAttribute("data-id", evt.id);
      dot.setAttribute("title", "Event " + displayIndex);
      dot.style.left = pct + "%";
      dot.innerHTML = '<span class="marker-dot-number">' + displayIndex + "</span>";
      timelineLineBar.appendChild(dot);
    });

    var connectorLayer = timelineHorizontal.querySelector(".connector-layer");
    if (!connectorLayer) {
      connectorLayer = document.createElement("div");
      connectorLayer.className = "connector-layer";
      var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("class", "connector-svg");
      var g = document.createElementNS("http://www.w3.org/2000/svg", "g");
      g.setAttribute("id", "connector-lines");
      svg.appendChild(g);
      connectorLayer.appendChild(svg);
      timelineHorizontal.insertBefore(connectorLayer, timelineCallouts);
    }
    var connectorG = connectorLayer.querySelector("#connector-lines");
    connectorG.innerHTML = "";
    items.forEach(function (item) {
      var line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("data-id", item.evt.id);
      line.setAttribute("stroke-width", "1");
      connectorG.appendChild(line);
    });

    requestAnimationFrame(function () {
      updateConnectorPositions();
    });

    timelineCallouts.querySelectorAll(".dropdown-trigger").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.stopPropagation();
        var menu = btn.nextElementSibling;
        var isOpen = !menu.hidden;
        closeAllDropdowns(timelineCallouts);
        if (!isOpen) {
          menu.hidden = false;
          btn.setAttribute("aria-expanded", "true");
        }
      });
    });
    timelineCallouts.querySelectorAll(".btn-edit").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.stopPropagation();
        var id = btn.getAttribute("data-id");
        closeAllDropdowns(timelineCallouts);
        startEdit(id);
      });
    });
    timelineCallouts.querySelectorAll(".btn-delete").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.stopPropagation();
        var id = btn.getAttribute("data-id");
        closeAllDropdowns(timelineCallouts);
        deleteEvent(id);
      });
    });
    timelineCallouts.querySelectorAll(".btn-view-source").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.stopPropagation();
        var id = btn.getAttribute("data-id");
        closeAllDropdowns(timelineCallouts);
        var events = loadEvents();
        var evt = events.find(function (e) { return e.id === id; });
        if (evt && evt.source) window.open(evt.source, "_blank", "noopener,noreferrer");
      });
    });

    timelineCallouts.querySelectorAll(".event-name-clickable").forEach(function (el) {
      el.addEventListener("click", function (e) {
        e.stopPropagation();
        var id = el.getAttribute("data-id");
        if (id) showDetailsPanel(id);
      });
      el.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          e.stopPropagation();
          var id = el.getAttribute("data-id");
          if (id) showDetailsPanel(id);
        }
      });
    });

    timelineCallouts.querySelectorAll(".draggable-callout").forEach(function (box) {
      setupDraggableCallout(box);
      var id = box.getAttribute("data-id");
      box.addEventListener("mouseenter", function () {
        var layer = timelineHorizontal.querySelector(".connector-layer");
        if (layer) {
          var line = layer.querySelector("line[data-id=\"" + id + "\"]");
          if (line) line.classList.add("connector-hover");
        }
      });
      box.addEventListener("mouseleave", function () {
        var layer = timelineHorizontal.querySelector(".connector-layer");
        if (layer) {
          var line = layer.querySelector("line[data-id=\"" + id + "\"]");
          if (line) line.classList.remove("connector-hover");
        }
      });
    });

    if (typeof window !== "undefined" && window.ResizeObserver && timelineViewport) {
      var ro = timelineViewport._connectorResizeObserver;
      if (!ro) {
        ro = new ResizeObserver(function () { updateConnectorPositions(); });
        ro.observe(timelineViewport);
        timelineViewport._connectorResizeObserver = ro;
      }
    }
    if (typeof window !== "undefined" && timelineViewport && !timelineViewport._connectorScrollBound) {
      timelineViewport._connectorScrollBound = true;
      window.addEventListener("scroll", function () { updateConnectorPositions(); }, true);
    }
    lastVisibleEvents = visibleEvents.slice();
    renderEventsList(visibleEvents, fullEvents.length);
    updateScalerUI();
  }

  function updateConnectorPositions() {
    if (!timelineHorizontal || !timelineWorld || timelineWorld.hidden) return;
    var layer = timelineHorizontal.querySelector(".connector-layer");
    var svg = layer && layer.querySelector(".connector-svg");
    if (!layer || !svg) return;
    var worldRect = timelineWorld.getBoundingClientRect();
    var zoom = timelineZoom || 1;
    if (worldRect.width === 0 || worldRect.height === 0) return;
    var contentW = worldRect.width / zoom;
    var contentH = worldRect.height / zoom;
    var lines = layer.querySelectorAll("line[data-id]");
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i];
      var id = line.getAttribute("data-id");
      var dot = timelineLineBar.querySelector(".marker-dot[data-id=\"" + id + "\"]");
      var box = timelineCallouts.querySelector(".callout-box[data-id=\"" + id + "\"]");
      var marker = timelineCallouts.querySelector(".timeline-event-callout[data-id=\"" + id + "\"]");
      if (!dot || !box || !marker) continue;
      var side = marker.getAttribute("data-side");
      var dotRect = dot.getBoundingClientRect();
      var boxRect = box.getBoundingClientRect();
      var x1 = (boxRect.left + boxRect.width / 2 - worldRect.left) / zoom;
      var y1;
      if (side === "above") {
        y1 = (boxRect.bottom - worldRect.top) / zoom;
      } else {
        y1 = (boxRect.top - worldRect.top) / zoom;
      }
      var x2 = (dotRect.left + dotRect.width / 2 - worldRect.left) / zoom;
      var y2 = (dotRect.top + dotRect.height / 2 - worldRect.top) / zoom;
      line.setAttribute("x1", x1);
      line.setAttribute("y1", y1);
      line.setAttribute("x2", x2);
      line.setAttribute("y2", y2);
    }
    svg.setAttribute("width", contentW);
    svg.setAttribute("height", contentH);
    svg.setAttribute("viewBox", "0 0 " + contentW + " " + contentH);
  }

  function parseBoxTransform(box) {
    var t = (box && box.style && box.style.transform) || "";
    var m = t.match(/translate\((-?\d+(?:\.\d+)?)px,\s*(-?\d+(?:\.\d+)?)px\)/);
    return m ? { x: parseFloat(m[1], 10), y: parseFloat(m[2], 10) } : { x: 0, y: 0 };
  }

  function setupDraggableCallout(box) {
    var startX, startY, startTransformX, startTransformY;
    function onMouseDown(e) {
      if (e.target.closest(".dropdown-trigger") || e.target.closest(".dropdown-menu") || e.target.closest("a") || e.target.closest(".event-name-clickable")) return;
      e.preventDefault();
      var t = parseBoxTransform(box);
      startX = e.clientX;
      startY = e.clientY;
      startTransformX = t.x;
      startTransformY = t.y;
      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
      box.classList.add("dragging");
    }
    function onMouseMove(e) {
      var dx = e.clientX - startX;
      var dy = e.clientY - startY;
      box.style.transform = "translate(" + (startTransformX + dx) + "px, " + (startTransformY + dy) + "px) scale(var(--uiScale, 1))";
      updateConnectorPositions();
    }
    function onMouseUp(e) {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
      box.classList.remove("dragging");
      var t = parseBoxTransform(box);
      var id = box.getAttribute("data-id");
      var events = loadEvents();
      var evt = events.find(function (e) { return e.id === id; });
      if (evt) {
        evt.dragOffset = { x: t.x, y: t.y };
        saveEvents(events);
      }
      updateConnectorPositions();
    }
    box.addEventListener("mousedown", onMouseDown);
    box.style.cursor = "grab";
  }

  function closeAllDropdowns(container) {
    if (!container) return;
    container.querySelectorAll(".dropdown-menu").forEach(function (menu) {
      menu.hidden = true;
    });
    container.querySelectorAll(".dropdown-trigger").forEach(function (trigger) {
      trigger.setAttribute("aria-expanded", "false");
    });
  }

  function getDisplayIndexForId(id) {
    var idx = lastVisibleEvents.findIndex(function (e) { return e.id === id; });
    return idx === -1 ? null : idx + 1;
  }

  function formatScalerDate(ms) {
    try {
      return new Date(ms).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
    } catch (_) {
      return "—";
    }
  }

  function formatScalerRangeDisplay(ms) {
    try {
      var d = new Date(ms);
      if (Number.isNaN(d.getTime())) return "—";
      return d.getDate() + "." + (d.getMonth() + 1) + "." + d.getFullYear();
    } catch (_) {
      return "—";
    }
  }

  function formatPillDate(isoOrMs) {
    try {
      var d = new Date(isoOrMs);
      if (Number.isNaN(d.getTime())) return "—";
      var day = String(d.getDate()).padStart(2, "0");
      var month = String(d.getMonth() + 1).padStart(2, "0");
      var year = d.getFullYear();
      return day + "." + month + "." + year;
    } catch (_) {
      return "—";
    }
  }

  function updateScalerUI() {
    if (!scaleRange || !viewRange) {
      if (timelineScalerSelection) {
        timelineScalerSelection.style.left = "0%";
        timelineScalerSelection.style.width = "100%";
      }
      if (scalerHandleLeft) scalerHandleLeft.style.left = "0%";
      if (scalerHandleRight) scalerHandleRight.style.left = "100%";
      if (scalerHandleRight) scalerHandleRight.style.marginLeft = "-8px";
      if (scalerRangeDisplay) scalerRangeDisplay.textContent = "—";
      return;
    }
    var total = scaleRange.endMs - scaleRange.startMs;
    if (total <= 0) return;
    var leftPct = ((viewRange.startMs - scaleRange.startMs) / total) * 100;
    var widthPct = ((viewRange.endMs - viewRange.startMs) / total) * 100;
    leftPct = Math.max(0, Math.min(100, leftPct));
    widthPct = Math.max(0.5, Math.min(100 - leftPct, widthPct));
    if (timelineScalerSelection) {
      timelineScalerSelection.style.left = leftPct + "%";
      timelineScalerSelection.style.width = widthPct + "%";
    }
    if (scalerHandleLeft) scalerHandleLeft.style.left = leftPct + "%";
    if (scalerHandleRight) {
      scalerHandleRight.style.left = (leftPct + widthPct) + "%";
      scalerHandleRight.style.marginLeft = "-8px";
    }
    if (scalerRangeDisplay) {
      scalerRangeDisplay.textContent = formatScalerRangeDisplay(viewRange.startMs) + " – " + formatScalerRangeDisplay(viewRange.endMs);
    }
  }

  function msToPct(ms) {
    if (!scaleRange) return 0;
    var total = scaleRange.endMs - scaleRange.startMs;
    return total <= 0 ? 0 : ((ms - scaleRange.startMs) / total) * 100;
  }

  function pctToMs(pct) {
    if (!scaleRange) return 0;
    var total = scaleRange.endMs - scaleRange.startMs;
    return scaleRange.startMs + (pct / 100) * total;
  }

  function applyViewRangeFromScaler(leftPct, widthPct) {
    if (!scaleRange) return;
    leftPct = Math.max(0, Math.min(100, leftPct));
    widthPct = Math.max(0.5, Math.min(100, widthPct));
    if (leftPct + widthPct > 100) widthPct = 100 - leftPct;
    viewRange = { startMs: pctToMs(leftPct), endMs: pctToMs(leftPct + widthPct) };
    saveViewRange(viewRange);
    renderTimeline();
  }

  function setupScalerInteractions() {
    if (!timelineScalerOverview) return;
    var overview = timelineScalerOverview;
    var selection = timelineScalerSelection;
    var handleLeft = scalerHandleLeft;
    var handleRight = scalerHandleRight;

    function getPctFromEvent(e) {
      var rect = overview.getBoundingClientRect();
      var x = e.clientX - rect.left;
      return (x / rect.width) * 100;
    }

    selection.style.pointerEvents = "auto";
    selection.addEventListener("pointerdown", function (e) {
      if (e.target !== selection && !selection.contains(e.target)) return;
      e.preventDefault();
      var startPct = getPctFromEvent(e);
      var startLeft = msToPct(viewRange.startMs);
      var startWidth = msToPct(viewRange.endMs) - startLeft;
      selection.setPointerCapture(e.pointerId);
      function onMove(ev) {
        var pct = getPctFromEvent(ev);
        var delta = pct - startPct;
        var newLeft = Math.max(0, Math.min(100 - startWidth, startLeft + delta));
        applyViewRangeFromScaler(newLeft, startWidth);
      }
      function onUp(ev) {
        selection.releasePointerCapture(ev.pointerId);
        document.removeEventListener("pointermove", onMove);
        document.removeEventListener("pointerup", onUp);
      }
      document.addEventListener("pointermove", onMove);
      document.addEventListener("pointerup", onUp);
    });

    handleLeft.addEventListener("pointerdown", function (e) {
      if (!viewRange || !scaleRange) return;
      e.preventDefault();
      e.stopPropagation();
      var startLeft = msToPct(viewRange.startMs);
      var endPct = msToPct(viewRange.endMs);
      handleLeft.setPointerCapture(e.pointerId);
      function onMove(ev) {
        var pct = getPctFromEvent(ev);
        var newLeft = Math.max(0, Math.min(pct, endPct - 1));
        applyViewRangeFromScaler(newLeft, endPct - newLeft);
      }
      function onUp(ev) {
        handleLeft.releasePointerCapture(ev.pointerId);
        document.removeEventListener("pointermove", onMove);
        document.removeEventListener("pointerup", onUp);
      }
      document.addEventListener("pointermove", onMove);
      document.addEventListener("pointerup", onUp);
    });

    handleRight.addEventListener("pointerdown", function (e) {
      if (!viewRange || !fullRange) return;
      e.preventDefault();
      e.stopPropagation();
      var startPct = msToPct(viewRange.startMs);
      var startRight = msToPct(viewRange.endMs);
      handleRight.setPointerCapture(e.pointerId);
      function onMove(ev) {
        var pct = getPctFromEvent(ev);
        var newRight = Math.max(startPct + 1, Math.min(100, pct));
        applyViewRangeFromScaler(startPct, newRight - startPct);
      }
      function onUp(ev) {
        handleRight.releasePointerCapture(ev.pointerId);
        document.removeEventListener("pointermove", onMove);
        document.removeEventListener("pointerup", onUp);
      }
      document.addEventListener("pointermove", onMove);
      document.addEventListener("pointerup", onUp);
    });

    overview.addEventListener("wheel", function (e) {
      if (!scaleRange || !viewRange) return;
      e.preventDefault();
      var rect = overview.getBoundingClientRect();
      var cursorPct = ((e.clientX - rect.left) / rect.width) * 100;
      var cursorMs = pctToMs(cursorPct);
      var span = viewRange.endMs - viewRange.startMs;
      var factor = e.deltaY > 0 ? 1.15 : 1 / 1.15;
      var maxSpan = scaleRange.endMs - scaleRange.startMs;
      var newSpan = Math.max(24 * 60 * 60 * 1000, Math.min(maxSpan, span * factor));
      var newStart = cursorMs - (cursorMs - viewRange.startMs) * (newSpan / span);
      var newEnd = newStart + newSpan;
      if (newStart < scaleRange.startMs) {
        newStart = scaleRange.startMs;
        newEnd = Math.min(scaleRange.endMs, newStart + newSpan);
      }
      if (newEnd > scaleRange.endMs) {
        newEnd = scaleRange.endMs;
        newStart = Math.max(scaleRange.startMs, newEnd - newSpan);
      }
      viewRange = { startMs: newStart, endMs: newEnd };
      saveViewRange(viewRange);
      renderTimeline();
    }, { passive: false });
  }

  if (btnYearScaleApply && scaleFirstDateInput && scaleLastDateInput) {
    btnYearScaleApply.addEventListener("click", function () {
      var startDate = (scaleFirstDateInput.value || "").trim();
      var endDate = (scaleLastDateInput.value || "").trim();
      if (!startDate || !endDate || startDate > endDate) return;
      scaleRange = getScaleRangeFromDates(startDate, endDate);
      if (!scaleRange) return;
      scaleStartDate = startDate;
      scaleEndDate = endDate;
      saveScaleDates(scaleStartDate, scaleEndDate);
      viewRange = { startMs: scaleRange.startMs, endMs: scaleRange.endMs };
      saveViewRange(viewRange);
      renderTimeline();
    });
  }
  setupScalerInteractions();

  function renderEventsList(visibleEvents, totalCount) {
    if (!eventsListEl) return;
    var summaryEl = document.getElementById("events-list-summary");
    if (summaryEl) {
      if (totalCount === 0) summaryEl.textContent = "";
      else if (visibleEvents.length === totalCount) summaryEl.textContent = "Showing " + totalCount + " events";
      else summaryEl.textContent = "Showing " + visibleEvents.length + " of " + totalCount;
    }
    visibleEvents = visibleEvents || [];
    var sorted = visibleEvents.slice().sort(function (a, b) { return (a.time || "").localeCompare(b.time || ""); });
    eventsListEl.innerHTML = "";
    sorted.forEach(function (evt, i) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "events-list-item";
      btn.setAttribute("data-id", evt.id);
      btn.innerHTML = "<span class=\"events-list-item-badge\">" + (i + 1) + "</span><span class=\"events-list-item-name\">" + escapeHtml(evt.name || "") + "</span>";
      btn.addEventListener("click", function () {
        showDetailsPanel(evt.id);
      });
      eventsListEl.appendChild(btn);
    });
  }

  function showDetailsPanel(id) {
    activeEventId = id;
    renderDetailsPanel();
  }

  function hideDetailsPanel() {
    activeEventId = null;
    if (eventDetailsContent) {
      eventDetailsContent.innerHTML = "<p class=\"event-details-placeholder\">Empty state — click an event on the timeline or in the Events list to view details.</p>";
    }
  }

  function renderDetailsPanel() {
    if (!eventDetailsContent) return;
    if (!activeEventId) {
      eventDetailsContent.innerHTML = "<p class=\"event-details-placeholder\">Empty state — click an event on the timeline or in the Events list to view details.</p>";
      return;
    }
    var events = loadEvents();
    var evt = events.find(function (e) { return e.id === activeEventId; });
    if (!evt) {
      eventDetailsContent.innerHTML = "<p class=\"event-details-placeholder\">Event not found.</p>";
      return;
    }
    var displayIndex = getDisplayIndexForId(activeEventId);
    var sourceHtml = evt.source && String(evt.source).trim()
      ? '<p class="event-details-source"><a href="' + escapeHtml(evt.source) + '" target="_blank" rel="noopener noreferrer">Source</a></p>'
      : "";
    var dateTimeHtml = '<p class="event-details-datetime">' + escapeHtml(formatDisplayTime(evt.time || "")) + "</p>";
    eventDetailsContent.innerHTML =
      '<p class="event-details-number"><span class="event-details-badge">' + (displayIndex != null ? displayIndex : "—") + "</span></p>" +
      '<h3 class="event-details-name">' + escapeHtml(evt.name || "") + "</h3>" +
      dateTimeHtml +
      '<div class="event-details-description">' + escapeHtml(evt.description || "") + "</div>" +
      sourceHtml;
  }

  function startEdit(id) {
    var events = loadEvents();
    var evt = events.find(function (e) { return e.id === id; });
    if (!evt) return;
    editingId = id;
    nameInput.value = evt.name || "";
    descInput.value = evt.description || "";
    if (sourceInput) sourceInput.value = evt.source || "";
    if (dateInput) dateInput.value = isoToDateInput(evt.time || "");
    if (timeInput) timeInput.value = isoToTimeInput(evt.time || "");
    clearFieldErrors();
    formTitle.textContent = "Edit event";
    btnSubmit.textContent = "Update event";
    btnCancel.hidden = false;
    form.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function cancelEdit() {
    editingId = null;
    nameInput.value = "";
    descInput.value = "";
    if (sourceInput) sourceInput.value = "";
    if (dateInput) dateInput.value = "";
    if (timeInput) timeInput.value = "";
    clearFieldErrors();
    formTitle.textContent = "Create New Event";
    btnSubmit.textContent = "Add event";
    btnCancel.hidden = true;
  }

  function deleteEvent(id) {
    if (!confirm("Delete this event?")) return;
    var events = loadEvents().filter(function (e) { return e.id !== id; });
    saveEvents(events);
    if (editingId === id) cancelEdit();
    if (activeEventId === id) hideDetailsPanel();
    renderTimeline();
  }

  function escapeHtml(s) {
    var div = document.createElement("div");
    div.textContent = s;
    return div.innerHTML;
  }

  function loadIndicatorsStore() {
    try {
      var raw = localStorage.getItem(INDICATORS_STORAGE_KEY);
      if (!raw) return { What: [], Who: [], When: [], Where: [], Why: [], How: [] };
      var o = JSON.parse(raw);
      INDICATORS_ENTITIES.forEach(function (key) {
        if (!Array.isArray(o[key])) o[key] = [];
      });
      return o;
    } catch (_) {
      return { What: [], Who: [], When: [], Where: [], Why: [], How: [] };
    }
  }

  function saveIndicatorsStore(store) {
    localStorage.setItem(INDICATORS_STORAGE_KEY, JSON.stringify(store));
  }

  function resetIndicatorsForm() {
    if (!indicatorsModal) return;
    INDICATORS_ENTITIES.forEach(function (entity) {
      var block = indicatorsModal.querySelector(".indicators-entity[data-entity=\"" + entity + "\"]");
      if (!block) return;
      var rowsContainer = block.querySelector(".indicators-entity-rows");
      if (!rowsContainer) return;
      rowsContainer.innerHTML = "";
      var row = document.createElement("div");
      row.className = "indicators-row";
      row.innerHTML =
        "<input type=\"text\" class=\"indicators-input\" placeholder=\"" + escapeHtml(INDICATORS_PLACEHOLDERS[entity]) + "\" data-entity=\"" + escapeHtml(entity) + "\">" +
        "<button type=\"button\" class=\"indicators-add-row\" data-entity=\"" + escapeHtml(entity) + "\" aria-label=\"Add row\">+</button>";
      rowsContainer.appendChild(row);
      row.querySelector(".indicators-add-row").addEventListener("click", function () {
        addIndicatorsRow(entity);
      });
    });
  }

  function addIndicatorsRow(entity) {
    var block = indicatorsModal && indicatorsModal.querySelector(".indicators-entity[data-entity=\"" + entity + "\"]");
    if (!block) return;
    var rowsContainer = block.querySelector(".indicators-entity-rows");
    if (!rowsContainer) return;
    var row = document.createElement("div");
    row.className = "indicators-row";
    row.innerHTML =
      "<input type=\"text\" class=\"indicators-input\" placeholder=\"" + escapeHtml(INDICATORS_PLACEHOLDERS[entity]) + "\" data-entity=\"" + escapeHtml(entity) + "\">" +
      "<button type=\"button\" class=\"indicators-add-row\" data-entity=\"" + escapeHtml(entity) + "\" aria-label=\"Add row\">+</button>";
    rowsContainer.appendChild(row);
    row.querySelector(".indicators-add-row").addEventListener("click", function () {
      addIndicatorsRow(entity);
    });
  }

  function openIndicatorsPopup(fromDetailsPanel) {
    if (!indicatorsOverlay || !indicatorsModal) return;
    resetIndicatorsForm();
    indicatorsOverlay.hidden = false;
    if (fromDetailsPanel && panelDetails && !panelDetails.classList.contains("panel-hidden")) {
      indicatorsOverlay.classList.add("indicators-side-by-side");
      var panelRect = panelDetails.getBoundingClientRect();
      indicatorsModal.style.marginLeft = (panelRect.right + 16) + "px";
      indicatorsModal.style.marginTop = Math.max(16, panelRect.top) + "px";
    } else {
      indicatorsOverlay.classList.remove("indicators-side-by-side");
      indicatorsModal.style.marginLeft = "";
      indicatorsModal.style.marginTop = "";
    }
  }

  function closeIndicatorsPopup() {
    if (indicatorsOverlay) {
      indicatorsOverlay.hidden = true;
      indicatorsOverlay.classList.remove("indicators-side-by-side");
    }
  }

  function collectIndicatorsForm() {
    var out = { What: [], Who: [], When: [], Where: [], Why: [], How: [] };
    if (!indicatorsModal) return out;
    INDICATORS_ENTITIES.forEach(function (entity) {
      var inputs = indicatorsModal.querySelectorAll(".indicators-entity[data-entity=\"" + entity + "\"] .indicators-input");
      inputs.forEach(function (input) {
        var val = (input.value || "").trim();
        if (!val) return;
        val.split(",").forEach(function (part) {
          part = part.trim();
          if (part) out[entity].push(part);
        });
      });
    });
    return out;
  }

  function buildIndicatorsText(store) {
    var lines = [];
    var hasAny = false;
    INDICATORS_ENTITIES.forEach(function (entity) {
      var arr = store[entity];
      if (arr && arr.length > 0) {
        hasAny = true;
        lines.push(entity + "?");
        arr.forEach(function (item) {
          lines.push("- " + item);
        });
        lines.push("");
      }
    });
    if (!hasAny) return "No indicators yet.";
    return lines.join("\n").replace(/\n+$/, "");
  }

  function persistIndicatorsToFile(text, done) {
    function fallback() {
      var blob = new Blob([text], { type: "text/plain; charset=utf-8" });
      if (typeof window !== "undefined" && window.showSaveFilePicker) {
        window.showSaveFilePicker({ suggestedName: "Indicators.txt", types: [{ description: "Text file", accept: { "text/plain": [".txt"] } }] })
          .then(function (handle) {
            return handle.createWritable();
          })
          .then(function (writable) {
            return writable.write(blob).then(function () { return writable.close(); });
          })
          .then(function () { if (done) done(); })
          .catch(function () {
            var url = URL.createObjectURL(blob);
            var a = document.createElement("a");
            a.href = url;
            a.download = "Indicators.txt";
            a.click();
            URL.revokeObjectURL(url);
            if (done) done();
          });
      } else {
        var url = URL.createObjectURL(blob);
        var a = document.createElement("a");
        a.href = url;
        a.download = "Indicators.txt";
        a.click();
        URL.revokeObjectURL(url);
        if (done) done();
      }
    }
    fetch("/api/save-indicators", {
      method: "POST",
      headers: { "Content-Type": "text/plain; charset=utf-8" },
      body: text
    }).then(function (res) {
      if (res.ok) {
        if (done) done();
      } else {
        fallback();
      }
    }).catch(function () {
      fallback();
    });
  }

  function onCreateIndicatorsClick() {
    var formData = collectIndicatorsForm();
    var store = loadIndicatorsStore();
    INDICATORS_ENTITIES.forEach(function (key) {
      (formData[key] || []).forEach(function (item) {
        store[key].push(item);
      });
    });
    saveIndicatorsStore(store);
    closeIndicatorsPopup();
    var batchText = buildIndicatorsText(formData);
    if (batchText && batchText !== "No indicators yet.") {
      persistIndicatorsToFile(batchText);
    }
    resetIndicatorsForm();
  }

  if (btnIndicatorsToolbar) {
    btnIndicatorsToolbar.addEventListener("click", function () {
      openIndicatorsPopup(false);
    });
  }
  if (btnIndicatorsDetails) {
    btnIndicatorsDetails.addEventListener("click", function () {
      openIndicatorsPopup(true);
    });
  }
  if (indicatorsBtnCreate) {
    indicatorsBtnCreate.addEventListener("click", function () {
      onCreateIndicatorsClick();
    });
  }
  if (indicatorsBtnCancel) {
    indicatorsBtnCancel.addEventListener("click", closeIndicatorsPopup);
  }
  if (indicatorsModalClose) {
    indicatorsModalClose.addEventListener("click", closeIndicatorsPopup);
  }
  if (indicatorsBackdrop) {
    indicatorsBackdrop.addEventListener("click", closeIndicatorsPopup);
  }
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && indicatorsOverlay && !indicatorsOverlay.hidden) {
      closeIndicatorsPopup();
    }
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var data = validateForm();
    if (!data) return;

    var events = loadEvents();
    if (editingId) {
      var idx = events.findIndex(function (e) { return e.id === editingId; });
      if (idx !== -1) {
        var existing = events[idx];
        events[idx] = {
          id: editingId,
          name: data.name,
          description: data.description,
          source: data.source !== undefined ? data.source : existing.source,
          time: data.time,
          dragOffset: existing.dragOffset
        };
        saveEvents(events);
        cancelEdit();
      }
    } else {
      var newEvent = {
        id: generateId(),
        name: data.name,
        description: data.description,
        time: data.time
      };
      events.push(newEvent);
      saveEvents(events);
      nameInput.value = "";
      descInput.value = "";
      timeInput.value = "";
      clearFieldErrors();
    }
    renderTimeline();
  });

  btnCancel.addEventListener("click", function () {
    cancelEdit();
  });

  document.addEventListener("click", function () {
    closeAllDropdowns(timelineCallouts);
  });

  if (eventDetailsClose) {
    eventDetailsClose.addEventListener("click", function () {
      hideDetailsPanel();
    });
  }
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") hideDetailsPanel();
  });

  var LAYOUT_KEY = "ui.panelLayout";
  var PANEL_DEFAULTS = {
    "add-event": { x: 12, y: -3, w: 320, h: 375 },
    "events": { x: -1, y: -3, w: 280, h: 560 },
    "details": { x: -4, y: -1, w: -1, h: 280 }
  };

  function getPanelMaxHeight() {
    return window.innerHeight - (TOPBAR_HEIGHT + 16);
  }

  function getPanelDefault(id) {
    var d = PANEL_DEFAULTS[id];
    if (!d) return null;
    var topMargin = TOPBAR_HEIGHT + 12;
    var maxH = getPanelMaxHeight();
    var x = d.x;
    var y = d.y;
    var w = d.w;
    var h = Math.min(d.h, maxH);
    if (d.x === -1) x = window.innerWidth - (d.w || 280) - 12;
    else if (d.x === -2) x = Math.max(12, (window.innerWidth - (d.w || 420)) / 2);
    else if (d.x === -4) {
      var leftPanelW = 320;
      var rightPanelW = 280;
      var margin = 48;
      w = Math.min(1100, window.innerWidth - leftPanelW - rightPanelW - margin);
      x = leftPanelW + 24;
    }
    if (d.y === -1) y = window.innerHeight - h - 12;
    else if (d.y === -3) y = topMargin;
    if (d.w === -1) w = Math.min(1100, window.innerWidth - 320 - 280 - 48);
    return { x: x, y: y, w: w, h: h };
  }

  function loadPanelLayout() {
    try {
      var raw = localStorage.getItem(LAYOUT_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (_) {
      return {};
    }
  }

  function savePanelLayout(layout) {
    localStorage.setItem(LAYOUT_KEY, JSON.stringify(layout));
  }

  function clampPanelPosition(panelEl, id) {
    if (!panelEl) return;
    var top = parseFloat(panelEl.style.top) || 0;
    var h = parseFloat(panelEl.style.height) || 360;
    var maxH = getPanelMaxHeight();
    var minTop = TOPBAR_HEIGHT + 8;
    if (top < minTop) panelEl.style.top = minTop + "px";
    if (h > maxH) panelEl.style.height = maxH + "px";
  }

  function applyPanelLayout(panelEl, id) {
    if (!panelEl) return;
    var layout = loadPanelLayout();
    var def = getPanelDefault(id);
    var layoutDef = layout[id];
    var maxH = getPanelMaxHeight();
    var minTop = TOPBAR_HEIGHT + 8;
    if (layoutDef && typeof layoutDef.x === "number" && typeof layoutDef.y === "number" && typeof layoutDef.w === "number" && typeof layoutDef.h === "number") {
      panelEl.style.left = layoutDef.x + "px";
      panelEl.style.top = Math.max(minTop, layoutDef.y) + "px";
      panelEl.style.width = layoutDef.w + "px";
      panelEl.style.height = Math.min(layoutDef.h, maxH) + "px";
      if (id === "details") panelEl.style.right = "auto";
      if (id === "events") panelEl.style.right = "auto";
    } else if (def) {
      panelEl.style.left = def.x + "px";
      panelEl.style.top = def.y + "px";
      panelEl.style.width = def.w + "px";
      panelEl.style.height = def.h + "px";
      panelEl.style.right = "auto";
    }
  }

  function resetLayout() {
    localStorage.removeItem(LAYOUT_KEY);
    ["add-event", "events", "details"].forEach(function (id) {
      var el = document.getElementById("panel-" + (id === "add-event" ? "add-event" : id === "events" ? "events" : "details"));
      if (el) applyPanelLayout(el, id);
    });
  }

  function getResetViewPanelLayout() {
    var leftMargin = 12;
    var topMargin = TOPBAR_HEIGHT + 12;
    var bottomMargin = 12;
    var leftColWidth = 320;
    var gap = 24;
    var createPanelHeight = 375;
    var detailsPanelHeight = 280;
    var gapBetweenEventsAndCreate = 8;
    var maxH = getPanelMaxHeight();
    var eventsHeight = window.innerHeight - topMargin - bottomMargin - createPanelHeight - gapBetweenEventsAndCreate;
    eventsHeight = Math.max(200, Math.min(eventsHeight, maxH));
    var detailsWidth = window.innerWidth - (leftMargin + leftColWidth + gap) - leftMargin;
    detailsWidth = Math.max(420, detailsWidth);
    return {
      "add-event": {
        x: leftMargin,
        y: window.innerHeight - bottomMargin - createPanelHeight,
        w: leftColWidth,
        h: createPanelHeight
      },
      "events": {
        x: leftMargin,
        y: topMargin,
        w: leftColWidth,
        h: eventsHeight
      },
      "details": {
        x: leftMargin + leftColWidth + gap,
        y: window.innerHeight - bottomMargin - detailsPanelHeight,
        w: detailsWidth,
        h: detailsPanelHeight
      }
    };
  }

  function bringPanelToFront(panelEl) {
    if (!panelEl) return;
    maxPanelZ += 1;
    panelEl.style.zIndex = maxPanelZ;
  }

  function setupPanelDrag(handleEl, panelEl, panelId) {
    if (!handleEl || !panelEl) return;
    var minW = panelId === "details" ? 420 : 260;
    var minH = panelId === "details" ? 160 : panelId === "add-event" ? 280 : 360;
    handleEl.addEventListener("pointerdown", function (e) {
      if (e.target.tagName === "BUTTON" || e.target.tagName === "INPUT" || e.target.closest("button") || e.target.closest("input")) return;
      e.preventDefault();
      bringPanelToFront(panelEl);
      var startX = e.clientX;
      var startY = e.clientY;
      var startLeft = parseFloat(panelEl.style.left) || 0;
      var startTop = parseFloat(panelEl.style.top) || 0;
      handleEl.setPointerCapture(e.pointerId);
      function onMove(ev) {
        var dx = ev.clientX - startX;
        var dy = ev.clientY - startY;
        var minTop = TOPBAR_HEIGHT + 8;
        var newLeft = Math.max(0, startLeft + dx);
        var newTop = Math.max(minTop, startTop + dy);
        newLeft = Math.min(newLeft, window.innerWidth - (parseFloat(panelEl.style.width) || 320));
        newTop = Math.min(newTop, window.innerHeight - (parseFloat(panelEl.style.height) || 360));
        panelEl.style.left = newLeft + "px";
        panelEl.style.top = newTop + "px";
      }
      function onUp(ev) {
        handleEl.releasePointerCapture(ev.pointerId);
        handleEl.removeEventListener("pointermove", onMove);
        handleEl.removeEventListener("pointerup", onUp);
        clampPanelPosition(panelEl, panelId);
        var layout = loadPanelLayout();
        layout[panelId] = {
          x: parseFloat(panelEl.style.left) || 0,
          y: parseFloat(panelEl.style.top) || 0,
          w: parseFloat(panelEl.style.width) || 320,
          h: parseFloat(panelEl.style.height) || 360
        };
        savePanelLayout(layout);
      }
      handleEl.addEventListener("pointermove", onMove);
      handleEl.addEventListener("pointerup", onUp);
    });
  }

  function setupPanelResize(resizeEl, panelEl, panelId) {
    if (!resizeEl || !panelEl) return;
    var minW = panelId === "details" ? 420 : 260;
    var minH = panelId === "details" ? 160 : panelId === "add-event" ? 280 : 360;
    resizeEl.addEventListener("pointerdown", function (e) {
      e.preventDefault();
      var startX = e.clientX;
      var startY = e.clientY;
      var startW = parseFloat(panelEl.style.width) || 320;
      var startH = parseFloat(panelEl.style.height) || 360;
      resizeEl.setPointerCapture(e.pointerId);
      function onMove(ev) {
        var dw = ev.clientX - startX;
        var dh = ev.clientY - startY;
        var maxH = getPanelMaxHeight();
        var newW = Math.max(minW, startW + dw);
        var newH = Math.max(minH, Math.min(startH + dh, maxH));
        var left = parseFloat(panelEl.style.left) || 0;
        var top = parseFloat(panelEl.style.top) || 0;
        newW = Math.min(newW, window.innerWidth - left);
        newH = Math.min(newH, maxH);
        panelEl.style.width = newW + "px";
        panelEl.style.height = newH + "px";
        startX = ev.clientX;
        startY = ev.clientY;
        startW = newW;
        startH = newH;
      }
      function onUp(ev) {
        resizeEl.releasePointerCapture(ev.pointerId);
        resizeEl.removeEventListener("pointermove", onMove);
        resizeEl.removeEventListener("pointerup", onUp);
        clampPanelPosition(panelEl, panelId);
        var layout = loadPanelLayout();
        layout[panelId] = {
          x: parseFloat(panelEl.style.left) || 0,
          y: parseFloat(panelEl.style.top) || 0,
          w: parseFloat(panelEl.style.width) || 320,
          h: parseFloat(panelEl.style.height) || 360
        };
        savePanelLayout(layout);
      }
      resizeEl.addEventListener("pointermove", onMove);
      resizeEl.addEventListener("pointerup", onUp);
    });
  }

  [panelAddEvent, panelEvents, panelDetails].forEach(function (panelEl) {
    if (panelEl) {
      panelEl.addEventListener("mousedown", function () { bringPanelToFront(panelEl); });
    }
  });

  setupPanelDrag(document.getElementById("panel-add-event-handle"), panelAddEvent, "add-event");
  setupPanelDrag(document.getElementById("panel-events-handle"), panelEvents, "events");
  setupPanelDrag(document.getElementById("panel-details-handle"), panelDetails, "details");
  setupPanelResize(document.getElementById("panel-add-event-resize"), panelAddEvent, "add-event");
  setupPanelResize(document.getElementById("panel-events-resize"), panelEvents, "events");
  setupPanelResize(document.getElementById("panel-details-resize"), panelDetails, "details");

  applyPanelLayout(panelAddEvent, "add-event");
  applyPanelLayout(panelEvents, "events");
  applyPanelLayout(panelDetails, "details");

  var SHOW_ADD_EVENT_KEY = "ui.showAddEvent";
  var SHOW_EVENTS_KEY = "ui.showEvents";
  var SHOW_DETAILS_KEY = "ui.showEventDetails";

  function getLayoutVisibility(which) {
    var key = which === "add-event" ? SHOW_ADD_EVENT_KEY : which === "events" ? SHOW_EVENTS_KEY : SHOW_DETAILS_KEY;
    var raw = localStorage.getItem(key);
    if (raw === "false") return false;
    if (raw === "true") return true;
    return true;
  }

  function setLayoutVisibility(which, visible) {
    var key = which === "add-event" ? SHOW_ADD_EVENT_KEY : which === "events" ? SHOW_EVENTS_KEY : SHOW_DETAILS_KEY;
    localStorage.setItem(key, visible ? "true" : "false");
  }

  function applyLayoutVisibility() {
    var showAdd = getLayoutVisibility("add-event");
    var showEvents = getLayoutVisibility("events");
    var showDetails = getLayoutVisibility("details");
    if (panelAddEvent) panelAddEvent.classList.toggle("panel-hidden", !showAdd);
    if (panelEvents) panelEvents.classList.toggle("panel-hidden", !showEvents);
    if (panelDetails) panelDetails.classList.toggle("panel-hidden", !showDetails);
    if (layoutsCheckAddEvent) layoutsCheckAddEvent.checked = showAdd;
    if (layoutsCheckEvents) layoutsCheckEvents.checked = showEvents;
    if (layoutsCheckDetails) layoutsCheckDetails.checked = showDetails;
    if (layoutsToggleAddEvent) layoutsToggleAddEvent.setAttribute("aria-checked", showAdd ? "true" : "false");
    if (layoutsToggleEvents) layoutsToggleEvents.setAttribute("aria-checked", showEvents ? "true" : "false");
    if (layoutsToggleDetails) layoutsToggleDetails.setAttribute("aria-checked", showDetails ? "true" : "false");
  }

  var PADDING = 8;
  var openDropdownAnchor = null;
  var openDropdownMenu = null;
  var repositionListener = null;

  function positionDropdown(dropdownEl, anchorEl) {
    if (!dropdownEl || !anchorEl) return;
    dropdownEl.hidden = false;
    dropdownEl.style.visibility = "hidden";
    var menuW = dropdownEl.offsetWidth;
    var menuH = dropdownEl.offsetHeight;
    dropdownEl.style.visibility = "";
    var rect = anchorEl.getBoundingClientRect();
    var vw = window.innerWidth;
    var vh = window.innerHeight;
    var left = rect.right - menuW;
    var top = rect.bottom + 4;
    if (left + menuW > vw - PADDING) left = vw - PADDING - menuW;
    if (left < PADDING) left = PADDING;
    if (top + menuH > vh - PADDING) top = rect.top - 4 - menuH;
    if (top < PADDING) top = PADDING;
    if (top + menuH > vh - PADDING) top = vh - PADDING - menuH;
    dropdownEl.style.left = left + "px";
    dropdownEl.style.top = top + "px";
    dropdownEl.style.right = "auto";
  }

  function addRepositionListeners(menuEl, anchorEl) {
    function reposition() {
      if (menuEl && !menuEl.hidden && anchorEl) positionDropdown(menuEl, anchorEl);
    }
    repositionListener = reposition;
    window.addEventListener("resize", reposition);
    window.addEventListener("scroll", reposition, true);
  }

  function removeRepositionListeners() {
    if (repositionListener) {
      window.removeEventListener("resize", repositionListener);
      window.removeEventListener("scroll", repositionListener, true);
      repositionListener = null;
    }
    openDropdownAnchor = null;
    openDropdownMenu = null;
  }

  function openLayoutsMenu() {
    if (btnFileMenu && fileDropdown && !fileDropdown.hidden) {
      fileDropdown.hidden = true;
      btnFileMenu.setAttribute("aria-expanded", "false");
      removeRepositionListeners();
    }
    positionDropdown(layoutsDropdown, btnLayouts);
    if (layoutsDropdown) layoutsDropdown.hidden = false;
    if (btnLayouts) btnLayouts.setAttribute("aria-expanded", "true");
    addRepositionListeners(layoutsDropdown, btnLayouts);
    openDropdownMenu = layoutsDropdown;
    openDropdownAnchor = btnLayouts;
  }

  function closeLayoutsMenu() {
    if (openDropdownMenu === layoutsDropdown) removeRepositionListeners();
    if (layoutsDropdown) layoutsDropdown.hidden = true;
    if (btnLayouts) btnLayouts.setAttribute("aria-expanded", "false");
  }

  function openFileMenu() {
    if (btnLayouts && layoutsDropdown && !layoutsDropdown.hidden) {
      layoutsDropdown.hidden = true;
      btnLayouts.setAttribute("aria-expanded", "false");
      removeRepositionListeners();
    }
    positionDropdown(fileDropdown, btnFileMenu);
    if (fileDropdown) fileDropdown.hidden = false;
    if (btnFileMenu) btnFileMenu.setAttribute("aria-expanded", "true");
    addRepositionListeners(fileDropdown, btnFileMenu);
    openDropdownMenu = fileDropdown;
    openDropdownAnchor = btnFileMenu;
  }

  function closeFileMenu() {
    if (openDropdownMenu === fileDropdown) removeRepositionListeners();
    if (fileDropdown) fileDropdown.hidden = true;
    if (btnFileMenu) btnFileMenu.setAttribute("aria-expanded", "false");
  }

  if (btnLayouts && layoutsDropdown) {
    btnLayouts.addEventListener("click", function (e) {
      e.stopPropagation();
      var open = layoutsDropdown.hidden;
      if (open) openLayoutsMenu(); else closeLayoutsMenu();
    });
  }
  if (btnFileMenu && fileDropdown) {
    btnFileMenu.addEventListener("click", function (e) {
      e.stopPropagation();
      var open = fileDropdown.hidden;
      if (open) openFileMenu(); else closeFileMenu();
    });
  }
  document.addEventListener("click", function (e) {
    if (layoutsDropdown && !layoutsDropdown.hidden && btnLayouts && !btnLayouts.contains(e.target) && !layoutsDropdown.contains(e.target)) closeLayoutsMenu();
    if (fileDropdown && !fileDropdown.hidden && btnFileMenu && !btnFileMenu.contains(e.target) && !fileDropdown.contains(e.target)) closeFileMenu();
  });

  if (layoutsCheckAddEvent) {
    layoutsCheckAddEvent.addEventListener("change", function () {
      var visible = layoutsCheckAddEvent.checked;
      setLayoutVisibility("add-event", visible);
      applyLayoutVisibility();
    });
  }
  if (layoutsCheckEvents) {
    layoutsCheckEvents.addEventListener("change", function () {
      var visible = layoutsCheckEvents.checked;
      setLayoutVisibility("events", visible);
      applyLayoutVisibility();
    });
  }
  if (layoutsCheckDetails) {
    layoutsCheckDetails.addEventListener("change", function () {
      var visible = layoutsCheckDetails.checked;
      setLayoutVisibility("details", visible);
      applyLayoutVisibility();
    });
  }
  if (layoutsToggleAddEvent) {
    layoutsToggleAddEvent.addEventListener("click", function (e) {
      if (e.target === layoutsCheckAddEvent) return;
      layoutsCheckAddEvent.checked = !layoutsCheckAddEvent.checked;
      setLayoutVisibility("add-event", layoutsCheckAddEvent.checked);
      applyLayoutVisibility();
    });
  }
  if (layoutsToggleEvents) {
    layoutsToggleEvents.addEventListener("click", function (e) {
      if (e.target === layoutsCheckEvents) return;
      layoutsCheckEvents.checked = !layoutsCheckEvents.checked;
      setLayoutVisibility("events", layoutsCheckEvents.checked);
      applyLayoutVisibility();
    });
  }
  if (layoutsToggleDetails) {
    layoutsToggleDetails.addEventListener("click", function (e) {
      if (e.target === layoutsCheckDetails) return;
      layoutsCheckDetails.checked = !layoutsCheckDetails.checked;
      setLayoutVisibility("details", layoutsCheckDetails.checked);
      applyLayoutVisibility();
    });
  }


  if (btnHideAddEvent) {
    btnHideAddEvent.addEventListener("click", function () {
      setLayoutVisibility("add-event", false);
      applyLayoutVisibility();
    });
  }
  if (btnHideEvents) {
    btnHideEvents.addEventListener("click", function () {
      setLayoutVisibility("events", false);
      applyLayoutVisibility();
    });
  }
  if (btnHideDetails) {
    btnHideDetails.addEventListener("click", function () {
      setLayoutVisibility("details", false);
      applyLayoutVisibility();
    });
  }

  function exportEventsToJson() {
    var events = loadEvents();
    function pad2(n) { return n < 10 ? "0" + n : String(n); }
    var exportData = events.map(function (evt) {
      var d = new Date(evt.time || 0);
      var dateStr = d.getFullYear() + "-" + pad2(d.getMonth() + 1) + "-" + pad2(d.getDate());
      var timeStr = pad2(d.getHours()) + ":" + pad2(d.getMinutes());
      return {
        name: evt.name || "",
        description: evt.description || "",
        source: evt.source != null && evt.source !== "" ? evt.source : "",
        date: dateStr,
        time: timeStr
      };
    });
    var json = JSON.stringify(exportData, null, 2);
    var blob = new Blob([json], { type: "application/json" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = "timeline-events.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  function downloadJsonTemplate() {
    var templateData = [
      {
        name: "Example Event 1",
        description: "Description of the first event",
        source: "https://example.com/source1",
        date: "2024-01-15",
        time: "10:30"
      },
      {
        name: "Example Event 2",
        description: "Description of the second event",
        source: "",
        date: "2024-02-20",
        time: "14:45"
      }
    ];
    var json = JSON.stringify(templateData, null, 2);
    var blob = new Blob([json], { type: "application/json" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = "timeline-template.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  function removeAllEvents() {
    if (!confirm("Remove all events? This cannot be undone.")) return;
    saveEvents([]);
    editingId = null;
    if (typeof cancelEdit === "function") cancelEdit();
    hideDetailsPanel();
    localStorage.removeItem(VIEW_RANGE_KEY);
    localStorage.removeItem(SCALE_DATES_KEY);
    renderTimeline();
    closeFileMenu();
  }

  if (fileImportEvents && jsonFileInput) {
    fileImportEvents.addEventListener("click", function () {
      closeFileMenu();
      jsonFileInput.value = "";
      jsonFileInput.click();
    });
  }
  if (fileExportEvents) {
    fileExportEvents.addEventListener("click", function () {
      exportEventsToJson();
      closeFileMenu();
    });
  }
  if (fileDownloadTemplate) {
    fileDownloadTemplate.addEventListener("click", function () {
      downloadJsonTemplate();
      closeFileMenu();
    });
  }
  if (fileRemoveAll) {
    fileRemoveAll.addEventListener("click", function () {
      removeAllEvents();
    });
  }

  applyLayoutVisibility();

  function applyTimelineTransform() {
    if (timelineWorld) {
      timelineWorld.style.transform = "translate(" + timelinePanX + "px, " + timelinePanY + "px) scale(" + timelineZoom + ")";
    }
    var zoom = timelineZoom || 1;
    var uiScale = Math.max(1, Math.min(2, 1 / zoom));
    document.documentElement.style.setProperty("--uiScale", String(uiScale));
    if (zoomLabel) zoomLabel.textContent = Math.round(zoom * 100) + "%";
    requestAnimationFrame(function () { updateConnectorPositions(); });
  }

  var ZOOM_MIN = 0.5;
  var ZOOM_MAX = 2.5;

  function zoomAtPoint(clientX, clientY, newZoom) {
    if (!timelineViewport || !timelineWorld) return;
    var rect = timelineViewport.getBoundingClientRect();
    var worldX = (clientX - rect.left - timelinePanX) / timelineZoom;
    var worldY = (clientY - rect.top - timelinePanY) / timelineZoom;
    timelineZoom = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, newZoom));
    timelinePanX = clientX - rect.left - worldX * timelineZoom;
    timelinePanY = clientY - rect.top - worldY * timelineZoom;
    applyTimelineTransform();
  }

  if (timelineViewport && timelineWorld) {
    timelineViewport.addEventListener("wheel", function (e) {
      if (timelineWorld.hidden) return;
      e.preventDefault();
      if (e.ctrlKey || e.metaKey) {
        var delta = -Math.sign(e.deltaY) * 0.15;
        zoomAtPoint(e.clientX, e.clientY, timelineZoom + delta);
      } else {
        var dx = e.deltaX;
        var dy = e.deltaY;
        if (e.shiftKey) { dx = e.deltaY; dy = 0; }
        timelinePanX += dx;
        timelinePanY += dy;
        applyTimelineTransform();
      }
    }, { passive: false });
  }

  var viewportDragStartX, viewportDragStartY, viewportDragPanX, viewportDragPanY;
  if (timelineViewport) {
    timelineViewport.addEventListener("pointerdown", function (e) {
      if (timelineWorld && timelineWorld.hidden) return;
      if (e.target.closest(".callout-box") || e.target.closest(".marker-dot") || e.target.closest("button")) return;
      e.currentTarget.setPointerCapture(e.pointerId);
      viewportDragStartX = e.clientX;
      viewportDragStartY = e.clientY;
      viewportDragPanX = timelinePanX;
      viewportDragPanY = timelinePanY;
    });
    timelineViewport.addEventListener("pointermove", function (e) {
      if (e.buttons !== 1) return;
      if (viewportDragStartX == null) return;
      timelinePanX = viewportDragPanX + (e.clientX - viewportDragStartX);
      timelinePanY = viewportDragPanY + (e.clientY - viewportDragStartY);
      applyTimelineTransform();
    });
    timelineViewport.addEventListener("pointerup", function (e) {
      viewportDragStartX = null;
    });
    timelineViewport.addEventListener("pointercancel", function () {
      viewportDragStartX = null;
    });
  }

  if (btnZoomIn) btnZoomIn.addEventListener("click", function () {
    if (timelineViewport) {
      var rect = timelineViewport.getBoundingClientRect();
      zoomAtPoint(rect.left + rect.width / 2, rect.top + rect.height / 2, timelineZoom + 0.25);
    } else {
      timelineZoom = Math.min(ZOOM_MAX, timelineZoom + 0.25);
      applyTimelineTransform();
    }
  });
  if (btnZoomOut) btnZoomOut.addEventListener("click", function () {
    if (timelineViewport) {
      var rect = timelineViewport.getBoundingClientRect();
      zoomAtPoint(rect.left + rect.width / 2, rect.top + rect.height / 2, timelineZoom - 0.25);
    } else {
      timelineZoom = Math.max(ZOOM_MIN, timelineZoom - 0.25);
      applyTimelineTransform();
    }
  });
  if (btnResetView) btnResetView.addEventListener("click", function () {
    scaleStartDate = RESET_SCALE_START;
    scaleEndDate = RESET_SCALE_END;
    saveScaleDates(scaleStartDate, scaleEndDate);
    scaleRange = getScaleRangeFromDates(scaleStartDate, scaleEndDate);
    if (scaleRange) {
      viewRange = { startMs: scaleRange.startMs, endMs: scaleRange.endMs };
      saveViewRange(viewRange);
    }
    syncScaleDateInputs();
    timelineZoom = RESET_ZOOM;
    timelinePanX = 0;
    timelinePanY = 0;
    var layout = getResetViewPanelLayout();
    savePanelLayout(layout);
    applyPanelLayout(panelAddEvent, "add-event");
    applyPanelLayout(panelEvents, "events");
    applyPanelLayout(panelDetails, "details");
    setLayoutVisibility("add-event", true);
    setLayoutVisibility("events", true);
    setLayoutVisibility("details", true);
    applyLayoutVisibility();
    renderTimeline();
    updateScalerUI();
    applyTimelineTransform();
  });

  if (jsonFileInput) {
    jsonFileInput.addEventListener("change", function () {
      var file = jsonFileInput.files[0];
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function (e) {
        var text = e.target && e.target.result;
        if (!text || typeof text !== "string") {
          alert("Could not read file.");
          return;
        }
        var data;
        try {
          data = JSON.parse(text);
        } catch (err) {
          alert("Invalid JSON: " + (err.message || "parse error"));
          return;
        }
        if (!Array.isArray(data)) {
          alert("JSON must be an array of event objects.");
          return;
        }
        var requiredKeys = ["name", "description", "source", "date", "time"];
        var urlRe = /^https?:\/\/.+/i;
        var dateRe = /^\d{4}-\d{2}-\d{2}$/;
        var timeRe = /^\d{1,2}:\d{2}$/;
        var events = loadEvents();
        for (var i = 0; i < data.length; i++) {
          var row = data[i];
          if (!row || typeof row !== "object") {
            alert("Row " + (i + 1) + ": must be an object.");
            return;
          }
          var missing = requiredKeys.filter(function (k) { return !(k in row); });
          if (missing.length > 0) {
            alert("Row " + (i + 1) + ": missing required keys: " + missing.join(", "));
            return;
          }
          var name = row.name;
          var description = row.description;
          var source = row.source;
          var date = row.date;
          var time = row.time;
          if (typeof name !== "string" || !name.trim()) {
            alert("Row " + (i + 1) + ": name must be a non-empty string.");
            return;
          }
          if (typeof description !== "string" || !description.trim()) {
            alert("Row " + (i + 1) + ": description must be a non-empty string.");
            return;
          }
          if (source !== undefined && source !== null && source !== "") {
            if (typeof source !== "string" || !urlRe.test(source.trim())) {
              alert("Row " + (i + 1) + ": source must be a URL string or empty.");
              return;
            }
            source = source.trim();
          } else {
            source = undefined;
          }
          if (typeof date !== "string" || !dateRe.test(date.trim())) {
            alert("Row " + (i + 1) + ": date must be YYYY-MM-DD.");
            return;
          }
          if (typeof time !== "string" || !timeRe.test(time.trim())) {
            alert("Row " + (i + 1) + ": time must be HH:MM (e.g. 00:00 or 15:50).");
            return;
          }
          date = date.trim();
          time = time.trim();
          if (time.length === 4) time = "0" + time;
          var combined = date + "T" + time + ":00";
          var d = new Date(combined);
          if (Number.isNaN(d.getTime())) {
            alert("Row " + (i + 1) + ": invalid date/time.");
            return;
          }
          events.push({
            id: generateId(),
            name: name.trim(),
            description: description.trim(),
            source: source,
            time: d.toISOString()
          });
        }
        saveEvents(events);
        renderTimeline();
      };
      reader.readAsText(file, "UTF-8");
    });
  }

  applyToolbarHeight(loadToolbarHeight() || DEFAULT_TOOLBAR_H);
  setupToolbarResize();
  renderTimeline();
  applyTimelineTransform();
})();
