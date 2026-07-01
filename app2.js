// ============================================================
// World Cup 2026 — Minimalist Radial Bracket Engine
// ============================================================

(function () {
  "use strict";

  // ================================================================
  // STATE
  // ================================================================
  const state = {
    picks: {
      r32: {}, // matchId -> teamCode
      r16: {},
      qf: {},
      sf: {},
      f: {}
    },
    simScores: {} // matchId -> {t1Score, t2Score, pen1, pen2}
  };

  let currentGraph = null;
  let arenaEl, modalOverlay, toastEl;
  let livePanel, liveFlag1, liveName1, liveScore1, liveFlag2, liveName2, liveScore2, liveMatchStatus, livePanelTitle;

  // ================================================================
  // HELPERS
  // ================================================================
  function team(code) {
    return TEAMS[code] || { name: code, iso2: "", code };
  }

  function flagSvg(code) {
    return getFlagUrlSvg(team(code).iso2);
  }

  function posOnCircle(cx, cy, radius, angleDeg) {
    const rad = (angleDeg - 90) * Math.PI / 180;
    return {
      x: cx + radius * Math.cos(rad),
      y: cy + radius * Math.sin(rad)
    };
  }

  function placeEl(el, cx, cy, radius, angleDeg) {
    const pos = posOnCircle(cx, cy, radius, angleDeg);
    el.style.left = pos.x + "px";
    el.style.top = pos.y + "px";
  }

  // ================================================================
  // BUILD GRAPH
  // ================================================================
  function buildNodesAndEdges() {
    const nodes = [];
    const edges = [];

    // Ring 0: R32 Teams (32 nodes)
    const ring0 = [];
    MATCHES_R32.forEach((m, i) => {
      let angle1, angle2;
      if (i < 8) {
        // Left hemisphere: Top-Left to Bottom-Left
        angle1 = 354.375 - (i * 2) * 11.25;
        angle2 = 354.375 - (i * 2 + 1) * 11.25;
      } else {
        // Right hemisphere: Top-Right to Bottom-Right
        const j = i - 8;
        angle1 = 5.625 + (j * 2) * 11.25;
        angle2 = 5.625 + (j * 2 + 1) * 11.25;
      }
      let s1 = m.score1, s2 = m.score2, p1 = m.penaltyScore1, p2 = m.penaltyScore2;
      if (state.simScores[m.id]) {
         s1 = state.simScores[m.id].t1Score; s2 = state.simScores[m.id].t2Score;
         p1 = state.simScores[m.id].pen1; p2 = state.simScores[m.id].pen2;
      }
      const n1 = { id: `${m.id}_t1`, matchId: m.id, round: "r32", team: m.team1, angle: angle1, ring: 0, status: m.status, score: s1, penScore: p1, isLive: m.status === 'live', side: 1 };
      const n2 = { id: `${m.id}_t2`, matchId: m.id, round: "r32", team: m.team2, angle: angle2, ring: 0, status: m.status, score: s2, penScore: p2, isLive: m.status === 'live', side: 2 };
      nodes.push(n1, n2);
      ring0.push({ m, n1, n2 });
    });

    // Ring 1: R16 Teams (16 nodes, winners of R32)
    const ring1 = [];
    ring0.forEach(({ m, n1, n2 }, i) => {
      const angle = (n1.angle + n2.angle) / 2;
      const winner = m.winner || state.picks.r32[m.id];
      
      if (winner) {
        if (n1.team) n1.isLoser = true;
        if (n2.team) n2.isLoser = true;
      }

      const n = { id: `${m.id}_w`, matchId: m.id, round: "r32", isTarget: true, team: winner, angle, ring: 1, t1: m.team1, t2: m.team2 };
      nodes.push(n);
      ring1.push({ m, node: n, angle, winner });

      edges.push({ from: n1.angle, to: angle, r1: 0, r2: 1, active: winner === m.team1 });
      edges.push({ from: n2.angle, to: angle, r1: 0, r2: 1, active: winner === m.team2 });
    });

    // Ring 2: QF Teams (8 nodes, winners of R16)
    const ring2 = [];
    R16_BRACKET.forEach((m, i) => {
      const f1 = ring1.find(x => x.m.id === m.feedFrom[0]);
      const f2 = ring1.find(x => x.m.id === m.feedFrom[1]);
      
      if (f1 && f2 && state.simScores[m.id]) {
         f1.node.score = state.simScores[m.id].t1Score;
         f2.node.score = state.simScores[m.id].t2Score;
         f1.node.penScore = state.simScores[m.id].pen1;
         f2.node.penScore = state.simScores[m.id].pen2;
      }
      
      const angle = (f1?.angle + f2?.angle) / 2;
      const winner = state.picks.r16[m.id];
      
      if (winner) {
        if (f1 && f1.node && f1.node.team) f1.node.isLoser = true;
        if (f2 && f2.node && f2.node.team) f2.node.isLoser = true;
      }

      const n = { id: `${m.id}_w`, matchId: m.id, round: "r16", isTarget: true, team: winner, angle, ring: 2, t1: f1.winner, t2: f2.winner };
      nodes.push(n);
      ring2.push({ m, node: n, angle, winner });

      edges.push({ from: f1.angle, to: angle, r1: 1, r2: 2, active: winner === f1.winner && winner != null });
      edges.push({ from: f2.angle, to: angle, r1: 1, r2: 2, active: winner === f2.winner && winner != null });
    });

    // Ring 3: SF Teams (4 nodes, winners of QF)
    const ring3 = [];
    QF_BRACKET.forEach((m, i) => {
      const f1 = ring2.find(x => x.m.id === m.feedFrom[0]);
      const f2 = ring2.find(x => x.m.id === m.feedFrom[1]);
      
      if (f1 && f2 && state.simScores[m.id]) {
         f1.node.score = state.simScores[m.id].t1Score;
         f2.node.score = state.simScores[m.id].t2Score;
         f1.node.penScore = state.simScores[m.id].pen1;
         f2.node.penScore = state.simScores[m.id].pen2;
      }
      
      const angle = (f1?.angle + f2?.angle) / 2;
      const winner = state.picks.qf[m.id];

      if (winner) {
        if (f1 && f1.node && f1.node.team) f1.node.isLoser = true;
        if (f2 && f2.node && f2.node.team) f2.node.isLoser = true;
      }

      const n = { id: `${m.id}_w`, matchId: m.id, round: "qf", isTarget: true, team: winner, angle, ring: 3, t1: f1.winner, t2: f2.winner };
      nodes.push(n);
      ring3.push({ m, node: n, angle, winner });

      edges.push({ from: f1.angle, to: angle, r1: 2, r2: 3, active: winner === f1.winner && winner != null });
      edges.push({ from: f2.angle, to: angle, r1: 2, r2: 3, active: winner === f2.winner && winner != null });
    });

    // Ring 4: F Teams (2 nodes, winners of SF)
    const ring4 = [];
    if (typeof SF_BRACKET !== 'undefined') {
      SF_BRACKET.forEach((m, i) => {
        const f1 = ring3.find(x => x.m.id === m.feedFrom[0]);
        const f2 = ring3.find(x => x.m.id === m.feedFrom[1]);
        
        if (f1 && f2 && state.simScores[m.id]) {
           f1.node.score = state.simScores[m.id].t1Score;
           f2.node.score = state.simScores[m.id].t2Score;
           f1.node.penScore = state.simScores[m.id].pen1;
           f2.node.penScore = state.simScores[m.id].pen2;
        }
        
        const angle = (f1?.angle + f2?.angle) / 2;
        const winner = state.picks.sf[m.id];

        if (winner) {
          if (f1 && f1.node && f1.node.team) f1.node.isLoser = true;
          if (f2 && f2.node && f2.node.team) f2.node.isLoser = true;
        }

        const n = { id: `${m.id}_w`, matchId: m.id, round: "sf", isTarget: true, team: winner, angle, ring: 4, t1: f1.winner, t2: f2.winner };
        nodes.push(n);
        ring4.push({ m, node: n, angle, winner });

        edges.push({ from: f1.angle, to: angle, r1: 3, r2: 4, active: winner === f1.winner && winner != null });
        edges.push({ from: f2.angle, to: angle, r1: 3, r2: 4, active: winner === f2.winner && winner != null });
      });
    }

    // Winner of Tournament
    if (typeof F_BRACKET !== 'undefined') {
      F_BRACKET.forEach((m, i) => {
        const f1 = ring4.find(x => x.m.id === m.feedFrom[0]);
        const f2 = ring4.find(x => x.m.id === m.feedFrom[1]);
        if(!f1 || !f2) return;
        
        if (state.simScores[m.id]) {
           f1.node.score = state.simScores[m.id].t1Score;
           f2.node.score = state.simScores[m.id].t2Score;
           f1.node.penScore = state.simScores[m.id].pen1;
           f2.node.penScore = state.simScores[m.id].pen2;
        }
        
        let angle = (f1.angle + f2.angle) / 2;
        if (Math.abs(f1.angle - f2.angle) > 180) {
           angle = ((f1.angle + f2.angle + 360) / 2) % 360;
        }
        
        const winner = state.picks.f[m.id];

        if (winner) {
          if (f1 && f1.node && f1.node.team) f1.node.isLoser = true;
          if (f2 && f2.node && f2.node.team) f2.node.isLoser = true;
        }

        // We can just show the winner at the center, or connect to a tiny ring 5
        const n = { id: `${m.id}_w`, matchId: m.id, round: "f", isTarget: true, team: winner, angle, ring: 5, t1: f1.winner, t2: f2.winner };
        nodes.push(n);

        edges.push({ from: f1.angle, to: angle, r1: 4, r2: 5, active: winner === f1.winner && winner != null });
        edges.push({ from: f2.angle, to: angle, r1: 4, r2: 5, active: winner === f2.winner && winner != null });
      });
    }

    return { nodes, edges };
  }

  // ================================================================
  // SVG EDGES
  // ================================================================
  function drawEdges(edges, size, cx, cy, radii) {
    const ns = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(ns, "svg");
    svg.classList.add("arena-svg");
    svg.setAttribute("viewBox", `0 0 ${size} ${size}`);

    edges.forEach(e => {
      const p1 = posOnCircle(cx, cy, radii[e.r1], e.from);
      const p2 = posOnCircle(cx, cy, radii[e.r2], e.to);

      const path = document.createElementNS(ns, "path");
      path.setAttribute("class", `connector${e.active ? " connector--active" : ""}`);

      if (e.r2 === 5) {
        // Straight line to center for the final winner
        path.setAttribute("d", `M ${p1.x} ${p1.y} L ${p2.x} ${p2.y}`);
        svg.appendChild(path);
      } else {
        // Create straight angular lines
        // Junction point is halfway along the radius at the target angle
        const midR = (radii[e.r1] + radii[e.r2]) / 2;
        const jx = posOnCircle(cx, cy, midR, e.to);

        path.setAttribute("d", `M ${p1.x} ${p1.y} L ${jx.x} ${jx.y} L ${p2.x} ${p2.y}`);
        svg.appendChild(path);

        // Branching dot at the junction
        const dot = document.createElementNS(ns, "circle");
        dot.setAttribute("cx", jx.x);
        dot.setAttribute("cy", jx.y);
        dot.setAttribute("r", 2.5);
        dot.setAttribute("class", `connector-dot${e.active ? " connector-dot--active" : ""}`);
        svg.appendChild(dot);
      }
    });

    return svg;
  }

  // ================================================================
  // RENDER NODES
  // ================================================================
  function createNodeEl(node) {
    const el = document.createElement("div");
    el.className = `team-node team-node--${node.round}`;
    if (node.ring === 5) el.classList.add("team-node--champion");
    
    el.dataset.id = node.id;
    el.dataset.match = node.matchId;
    el.dataset.round = node.round;
    el.dataset.ring = node.ring;
    el.dataset.angle = node.angle;
    el.dataset.team = node.team || "";

    if (node.isLoser) {
      el.classList.add("team-node--loser");
    }

    if (!node.team) {
      el.classList.add("team-node--empty");
      // Interaction for empty inner nodes if we have feeder teams
      if (node.t1 || node.t2) {
        el.addEventListener("click", () => showSelector(node));
      }
      return el;
    }

    const t = team(node.team);
    
    // Flag
    const img = document.createElement("img");
    img.src = flagSvg(node.team);
    img.className = "node-flag";
    img.alt = t.name;
    el.appendChild(img);

    if (node.ring === 5) {
      const winnerLabel = document.createElement("div");
      winnerLabel.className = "winner-label";
      winnerLabel.innerText = "WINNER";
      el.appendChild(winnerLabel);
    }

    // Score badge
    if (node.score !== undefined && node.score !== null) {
      const badge = document.createElement("div");
      badge.className = `node-score ${node.isLive ? 'node-score--live' : ''}`;
      badge.textContent = node.score;
      el.appendChild(badge);
    }
    
    // Penalty score badge
    if (node.penScore !== undefined && node.penScore !== null) {
      const penBadge = document.createElement("div");
      penBadge.className = "node-pen-score";
      penBadge.textContent = `(${node.penScore})`;
      el.appendChild(penBadge);
    }

    // Tooltip
    const tt = document.createElement("div");
    tt.className = "node-tooltip";
    tt.textContent = t.name;
    if (node.score !== undefined && node.score !== null) {
       tt.textContent += ` (${node.score})`;
       if (node.penScore !== undefined && node.penScore !== null) {
         tt.textContent += ` p(${node.penScore})`;
       }
    }
    el.appendChild(tt);

    // Interaction
    el.addEventListener("click", () => {
      // Advance this team to the next round!
      if (node.ring < 5) advanceTeam(node);
    });

    return el;
  }

  // ================================================================
  // RENDER BRACKET
  // ================================================================
  function buildBracket() {
    arenaEl.innerHTML = "";

    const size = Math.min(arenaEl.parentElement.clientWidth, arenaEl.parentElement.clientHeight) * 0.95;
    arenaEl.style.width = size + "px";
    arenaEl.style.height = size + "px";

    const cx = size / 2;
    const cy = size / 2;

    const radii = [
      size * 0.46, // R32 (0)
      size * 0.38, // R16 (1)
      size * 0.30, // QF  (2)
      size * 0.22, // SF  (3)
      size * 0.13, // F   (4)
      0            // Champ (5)
    ];

    currentGraph = buildNodesAndEdges();
    const graph = currentGraph;
    const svg = drawEdges(graph.edges, size, cx, cy, radii);
    arenaEl.appendChild(svg);

    // Trophy in center
    const trophy = document.createElement("div");
    trophy.className = "trophy-center";
    trophy.style.left = cx + "px";
    trophy.style.top = cy + "px";
    trophy.innerHTML = `<img src="real-trophy.png" onerror="this.onerror=null; this.src='real-trophy.jpg';" class="trophy-img" style="width: 50px; height: 90px; object-fit: contain; filter: drop-shadow(0 0 15px rgba(255, 215, 0, 0.4)); margin-top: -10px;" />`;
    arenaEl.appendChild(trophy);

    // Nodes
    graph.nodes.forEach(n => {
      const el = createNodeEl(n);
      if (n.ring === 5) {
        // Position exactly in the center bottom below trophy
        const offset = window.innerWidth <= 768 ? 45 : 60;
        el.style.left = cx + "px";
        el.style.top = (cy + offset) + "px";
      } else {
        const pos = posOnCircle(cx, cy, radii[n.ring], n.angle);
        el.style.left = pos.x + "px";
        el.style.top = pos.y + "px";
      }
      arenaEl.appendChild(el);
    });

    updateLivePanel();
  }

  function updateLivePanel() {
    if (!livePanel) return;
    
    let displayMatch = MATCHES_R32.find(m => m.status === 'live');
    let isLive = true;
    
    if (!displayMatch) {
       const finished = MATCHES_R32.filter(m => m.status === 'finished');
       if (finished.length > 0) {
           displayMatch = finished[finished.length - 1];
           isLive = false;
       }
    }

    if (!displayMatch) {
      livePanel.classList.add("hidden");
      return;
    }
    
    livePanel.classList.remove("hidden");
    const t1 = TEAMS[displayMatch.team1];
    const t2 = TEAMS[displayMatch.team2];
    
    liveFlag1.src = flagSvg(displayMatch.team1);
    liveName1.textContent = t1.name;
    liveScore1.textContent = displayMatch.score1;
    
    liveFlag2.src = flagSvg(displayMatch.team2);
    liveName2.textContent = t2.name;
    liveScore2.textContent = displayMatch.score2;
    
    if (liveMatchStatus) {
       liveMatchStatus.textContent = isLive ? "IN PLAY" : "FINISHED";
       const indicator = liveMatchStatus.parentElement.querySelector('.live-indicator');
       if (indicator) {
           indicator.style.display = isLive ? "inline-block" : "none";
       }
    }
    
    if (livePanelTitle) {
       livePanelTitle.textContent = isLive ? "LIVE MATCH" : "LAST MATCH";
    }
  }


  // ================================================================
  // INTERACTIONS
  // ================================================================
  function advanceTeam(sourceNode) {
    if (sourceNode.ring === 5) return;

    let stateObj, matchToUpdate, targetRing, targetMatchId;

    if (sourceNode.ring === 0) {
      const match = MATCHES_R32.find(m => m.id === sourceNode.matchId);
      if (match && match.status === 'finished') {
         return; // Disable advancing or rewinding for finished matches
      }
      matchToUpdate = sourceNode.matchId;
      stateObj = state.picks.r32;
      targetRing = 1;
      targetMatchId = sourceNode.matchId;
    } 
    else if (sourceNode.ring === 1) {
      const r16Match = R16_BRACKET.find(m => m.feedFrom.includes(sourceNode.matchId));
      if (!r16Match) return;
      const f1Winner = state.picks.r32[r16Match.feedFrom[0]] || MATCHES_R32.find(x => x.id === r16Match.feedFrom[0])?.winner;
      const f2Winner = state.picks.r32[r16Match.feedFrom[1]] || MATCHES_R32.find(x => x.id === r16Match.feedFrom[1])?.winner;
      if (!f1Winner || !f2Winner) {
         return;
      }
      matchToUpdate = r16Match.id;
      stateObj = state.picks.r16;
      targetRing = 2;
      targetMatchId = r16Match.id;
    }
    else if (sourceNode.ring === 2) {
      const qfMatch = QF_BRACKET.find(m => m.feedFrom.includes(sourceNode.matchId));
      if (!qfMatch) return;
      if (!state.picks.r16[qfMatch.feedFrom[0]] || !state.picks.r16[qfMatch.feedFrom[1]]) {
         return;
      }
      matchToUpdate = qfMatch.id;
      stateObj = state.picks.qf;
      targetRing = 3;
      targetMatchId = qfMatch.id;
    }
    else if (sourceNode.ring === 3) {
      const sfMatch = SF_BRACKET.find(m => m.feedFrom.includes(sourceNode.matchId));
      if (!sfMatch) return;
      if (!state.picks.qf[sfMatch.feedFrom[0]] || !state.picks.qf[sfMatch.feedFrom[1]]) {
         return;
      }
      matchToUpdate = sfMatch.id;
      stateObj = state.picks.sf;
      targetRing = 4;
      targetMatchId = sfMatch.id;
    }
    else if (sourceNode.ring === 4) {
      const fMatch = F_BRACKET.find(m => m.feedFrom.includes(sourceNode.matchId));
      if (!fMatch) return;
      if (!state.picks.sf[fMatch.feedFrom[0]] || !state.picks.sf[fMatch.feedFrom[1]]) {
         return;
      }
      matchToUpdate = fMatch.id;
      stateObj = state.picks.f;
      targetRing = 5;
      targetMatchId = fMatch.id;
    }

    const isHardcodedWinner = sourceNode.ring === 0 && MATCHES_R32.find(m => m.id === matchToUpdate)?.winner === sourceNode.team;
    if (stateObj[matchToUpdate] === sourceNode.team || isHardcodedWinner) {
      const targetEl = arenaEl.querySelector(`[data-match="${targetMatchId}"][data-ring="${targetRing}"]`);
      const targetRect = targetEl ? targetEl.getBoundingClientRect() : null;
      const srcEl = arenaEl.querySelector(`[data-id="${sourceNode.id}"] .node-flag`);
      const srcRect = srcEl ? srcEl.getBoundingClientRect() : null;

      if (!targetRect || !srcRect) {
        delete stateObj[matchToUpdate];
        clearDownstream(matchToUpdate, sourceNode.ring);
        buildBracket();
        return;
      }

      const animateRewind = async () => {
         const path = [];
         let cRing = targetRing;
         let cMatchId = matchToUpdate;
         path.push({ ring: cRing, matchId: cMatchId, el: targetEl });
         
         while (cRing < 5) {
            let nextMatch, nextStateObj;
            if (cRing === 1) { nextMatch = R16_BRACKET.find(m => m.feedFrom.includes(cMatchId)); nextStateObj = state.picks.r16; }
            else if (cRing === 2) { nextMatch = QF_BRACKET.find(m => m.feedFrom.includes(cMatchId)); nextStateObj = state.picks.qf; }
            else if (cRing === 3) { nextMatch = SF_BRACKET.find(m => m.feedFrom.includes(cMatchId)); nextStateObj = state.picks.sf; }
            else if (cRing === 4) { nextMatch = F_BRACKET.find(m => m.feedFrom.includes(cMatchId)); nextStateObj = state.picks.f; }
            
            if (nextMatch && nextStateObj && nextStateObj[nextMatch.id] === sourceNode.team) {
               cRing++;
               cMatchId = nextMatch.id;
               const el = arenaEl.querySelector(`[data-match="${cMatchId}"][data-ring="${cRing}"]`);
               if (el) path.push({ ring: cRing, matchId: cMatchId, el: el });
            } else {
               break;
            }
         }
         
         path.forEach(nodeData => {
            nodeData.el.style.transition = 'none';
            nodeData.el.innerHTML = '';
            nodeData.el.classList.add('team-node--empty');
            nodeData.el.style.boxShadow = 'none';
         });
         
         const fly = document.createElement("img");
         fly.src = flagSvg(sourceNode.team);
         fly.className = "flag-fly";
         document.body.appendChild(fly);
         
         const size = arenaEl.clientWidth;
         const cx = size / 2;
         const cy = size / 2;
         const radii = [size*0.46, size*0.37, size*0.28, size*0.19, size*0.10, 0];
         const arenaRect = arenaEl.getBoundingClientRect();
         
         const flyTo = (x, y, w, h, duration) => {
            return new Promise(resolve => {
               fly.style.transition = `all ${duration}ms linear`;
               fly.style.left = x + "px";
               fly.style.top = y + "px";
               fly.style.width = w + "px";
               fly.style.height = h + "px";
               setTimeout(resolve, duration + 20);
            });
         };
         
         let currentIdx = path.length - 1;
         const startRect = path[currentIdx].el.getBoundingClientRect();
         fly.style.left = startRect.left + "px";
         fly.style.top = startRect.top + "px";
         fly.style.width = startRect.width + "px";
         fly.style.height = startRect.height + "px";
         fly.offsetHeight; 
         
         while (currentIdx >= 0) {
            const fromData = path[currentIdx];
            const toData = currentIdx > 0 ? path[currentIdx - 1] : { ring: sourceNode.ring, el: srcEl };
            
            const fromRect = fromData.el.getBoundingClientRect();
            const toRect = toData.el.getBoundingClientRect();
            
            const midWidth = (fromRect.width + toRect.width) / 2;
            const midHeight = (fromRect.height + toRect.height) / 2;
            
            if (fromData.ring < 5) {
               const targetAngle = parseFloat(fromData.el.dataset.angle);
               const midR = (radii[toData.ring] + radii[fromData.ring]) / 2;
               const jxLocal = posOnCircle(cx, cy, midR, targetAngle);
               const jxCenterX = arenaRect.left + jxLocal.x;
               const jxCenterY = arenaRect.top + jxLocal.y;
               
               await flyTo(jxCenterX - midWidth/2, jxCenterY - midHeight/2, midWidth, midHeight, 150);
            }
            
            await flyTo(toRect.left, toRect.top, toRect.width, toRect.height, 150);
            
            currentIdx--;
         }
         
         fly.remove();
         delete stateObj[matchToUpdate];
         clearDownstream(matchToUpdate, sourceNode.ring);
         buildBracket();
      };
      
      animateRewind();
      return;
    }

    // Capture source flag for animation
    const srcEl = arenaEl.querySelector(`[data-id="${sourceNode.id}"] .node-flag`);
    const srcRect = srcEl ? srcEl.getBoundingClientRect() : null;

    // Find the target empty node BEFORE updating state
    const targetEl = arenaEl.querySelector(`[data-match="${targetMatchId}"][data-ring="${targetRing}"]`);
    if (!targetEl) return;
    
    const targetRect = targetEl.getBoundingClientRect();

    // Helper to actually apply the state and rebuild
    const applyStateAndRebuild = () => {
      // Clear downstream if switching
      if (stateObj[matchToUpdate] && stateObj[matchToUpdate] !== sourceNode.team) {
         clearDownstream(matchToUpdate, sourceNode.ring);
      }
      stateObj[matchToUpdate] = sourceNode.team;
      buildBracket();
    };

    // If no animation source, just update immediately
    if (!srcRect) {
      applyStateAndRebuild();
      return;
    }

    // Animate
    requestAnimationFrame(() => {
      const fly = document.createElement("img");
      fly.src = flagSvg(sourceNode.team);
      fly.className = "flag-fly";
      fly.style.left = srcRect.left + "px";
      fly.style.top = srcRect.top + "px";
      fly.style.width = srcRect.width + "px";
      fly.style.height = srcRect.height + "px";
      fly.style.transition = "all 0.3s linear";
      document.body.appendChild(fly);

      // Force reflow
      fly.offsetHeight;

      const finishAnimation = () => {
        fly.remove();
        applyStateAndRebuild();
      };

      if (targetRing < 5) {
        const targetAngle = parseFloat(targetEl.dataset.angle);
        const size = arenaEl.clientWidth;
        const cx = size / 2;
        const cy = size / 2;
        const radii = [size*0.46, size*0.37, size*0.28, size*0.19, size*0.10, 0];
        const midR = (radii[sourceNode.ring] + radii[targetRing]) / 2;
        const jxLocal = posOnCircle(cx, cy, midR, targetAngle);
        
        const arenaRect = arenaEl.getBoundingClientRect();
        const jxCenterX = arenaRect.left + jxLocal.x;
        const jxCenterY = arenaRect.top + jxLocal.y;
        
        const midWidth = (srcRect.width + targetRect.width) / 2;
        const midHeight = (srcRect.height + targetRect.height) / 2;

        // Step 1: Fly to junction
        fly.style.left = (jxCenterX - midWidth / 2) + "px";
        fly.style.top = (jxCenterY - midHeight / 2) + "px";
        fly.style.width = midWidth + "px";
        fly.style.height = midHeight + "px";

        let step1Done = false;
        const onStep1 = (e) => {
          if (e && e.propertyName !== "left") return;
          if (step1Done) return;
          step1Done = true;
          fly.removeEventListener("transitionend", onStep1);
          
          // Step 2: Fly to target
          fly.style.transition = "all 0.3s ease-out";
          fly.style.left = targetRect.left + "px";
          fly.style.top = targetRect.top + "px";
          fly.style.width = targetRect.width + "px";
          fly.style.height = targetRect.height + "px";

          let step2Done = false;
          const onStep2 = (e2) => {
            if (e2 && e2.propertyName !== "left") return;
            if (step2Done) return;
            step2Done = true;
            fly.removeEventListener("transitionend", onStep2);
            finishAnimation();
          };
          fly.addEventListener("transitionend", onStep2);
          // Fallback just in case transitionend fails
          setTimeout(onStep2, 350);
        };
        fly.addEventListener("transitionend", onStep1);
        setTimeout(onStep1, 350);
      } else {
        // Direct flight for Final
        // Step 1: Fly to center (trophy)
        const arenaRect = arenaEl.getBoundingClientRect();
        const cx = arenaRect.left + arenaEl.clientWidth / 2;
        const cy = arenaRect.top + arenaEl.clientHeight / 2;
        
        fly.style.transition = "all 0.4s ease-in-out";
        fly.style.left = (cx - targetRect.width / 2) + "px";
        fly.style.top = (cy - targetRect.height / 2) + "px";
        fly.style.width = targetRect.width + "px";
        fly.style.height = targetRect.height + "px";

        let step1Done = false;
        const onStep1 = (e) => {
          if (e && e.propertyName !== "left") return;
          if (step1Done) return;
          step1Done = true;
          fly.removeEventListener("transitionend", onStep1);
          
          // Step 2: Fly to targetRect (below trophy)
          fly.style.transition = "all 0.3s ease-out";
          fly.style.left = targetRect.left + "px";
          fly.style.top = targetRect.top + "px";
          
          let done = false;
          const onDone = (e2) => {
            if (e2 && e2.propertyName !== "left") return;
            if (done) return;
            done = true;
            fly.removeEventListener("transitionend", onDone);
            finishAnimation();
          };
          fly.addEventListener("transitionend", onDone);
          setTimeout(onDone, 350);
        };
        fly.addEventListener("transitionend", onStep1);
        setTimeout(onStep1, 450);
      }
    });
  }

  function clearDownstream(matchId, startRound) {
    if (startRound === 0) {
      const next = R16_BRACKET.find(m => m.feedFrom.includes(matchId));
      if (next) {
        delete state.picks.r16[next.id];
        clearDownstream(next.id, 1);
      }
    } else if (startRound === 1) {
      const next = QF_BRACKET.find(m => m.feedFrom.includes(matchId));
      if (next) {
        delete state.picks.qf[next.id];
        clearDownstream(next.id, 2);
      }
    } else if (startRound === 2) {
      const next = SF_BRACKET.find(m => m.feedFrom.includes(matchId));
      if (next) {
        delete state.picks.sf[next.id];
        clearDownstream(next.id, 3);
      }
    } else if (startRound === 3) {
      const next = F_BRACKET.find(m => m.feedFrom.includes(matchId));
      if (next) {
        delete state.picks.f[next.id];
        clearDownstream(next.id, 4);
      }
    }
  }

  function showSelector(emptyNode) {
     if (!emptyNode.t1 && !emptyNode.t2) return;
     // If user clicks an empty slot that has feeder teams, we could show a modal to pick between t1 and t2.
     // For simplicity in this UI, they should just click the outer node directly.
  }

  function spawnConfetti(x, y) {
    const colors = ["#c8a84f", "#60a5fa", "#ef4444", "#34d399", "#a78bfa"];
    for (let i = 0; i < 12; i++) {
      const p = document.createElement("div");
      p.className = "confetti";
      p.style.left = (x + (Math.random() * 40 - 20)) + "px";
      p.style.top = y + "px";
      p.style.width = (4 + Math.random() * 4) + "px";
      p.style.height = (4 + Math.random() * 4) + "px";
      p.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      p.style.animationDelay = (Math.random() * 0.2) + "s";
      document.body.appendChild(p);
      setTimeout(() => p.remove(), 1500);
    }
  }

  function showToast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("toast--show");
    clearTimeout(toastEl._timer);
    toastEl._timer = setTimeout(() => toastEl.classList.remove("toast--show"), 3000);
  }

  function closeModal() {
    modalOverlay.classList.remove("modal-overlay--visible");
  }

  function mapToApiTLA(internalTLA) {
    const mapping = {
      "DZA": ["ALG", "DZA"],
      "HRV": ["CRO", "HRV"],
      "DEU": ["GER", "DEU"],
      "NLD": ["NED", "NLD"],
      "PRY": ["PAR", "PRY"],
      "PRT": ["POR", "PRT"],
      "ZAF": ["RSA", "ZAF"],
      "CHE": ["SUI", "CHE"],
      "COD": ["COD", "DRC", "CGO", "ZAI"],
      "USA": ["USA"],
      "BIH": ["BIH", "BOS"]
    };
    return mapping[internalTLA] || [internalTLA];
  }

  function fetchLiveScores() {
    const getAllActiveMatches = () => {
       const active = [];
       MATCHES_R32.forEach(m => active.push({ id: m.id, team1: m.team1, team2: m.team2, orig: m, roundObj: state.picks.r32 }));
       R16_BRACKET.forEach(m => {
          const t1 = state.picks.r32[m.feedFrom[0]] || MATCHES_R32.find(x => x.id === m.feedFrom[0])?.winner;
          const t2 = state.picks.r32[m.feedFrom[1]] || MATCHES_R32.find(x => x.id === m.feedFrom[1])?.winner;
          if (t1 && t2) active.push({ id: m.id, team1: t1, team2: t2, orig: m, roundObj: state.picks.r16 });
       });
       QF_BRACKET.forEach(m => {
          const t1 = state.picks.r16[m.feedFrom[0]];
          const t2 = state.picks.r16[m.feedFrom[1]];
          if (t1 && t2) active.push({ id: m.id, team1: t1, team2: t2, orig: m, roundObj: state.picks.qf });
       });
       SF_BRACKET.forEach(m => {
          const t1 = state.picks.qf[m.feedFrom[0]];
          const t2 = state.picks.qf[m.feedFrom[1]];
          if (t1 && t2) active.push({ id: m.id, team1: t1, team2: t2, orig: m, roundObj: state.picks.sf });
       });
       F_BRACKET.forEach(m => {
          const t1 = state.picks.sf[m.feedFrom[0]];
          const t2 = state.picks.sf[m.feedFrom[1]];
          if (t1 && t2) active.push({ id: m.id, team1: t1, team2: t2, orig: m, roundObj: state.picks.f });
       });
       return active;
    };

    const fetchAPI = async () => {
      try {
        const window10s = Math.floor(Date.now() / 10000);
        const url = '/api/matches?t=' + window10s;
        const response = await fetch(url);
        const data = await response.json();
        
        if (!response.ok || data.error) {
            throw new Error(data.error || "Server response not OK");
        }
        
        if (!data.matches) {
            console.warn("No matches array in API response:", data);
            return;
        }

        const knockout = data.matches;
        
        let changed = false;
        const activeMatches = getAllActiveMatches();
        
        knockout.forEach(apiMatch => {
          if (!apiMatch.homeTeam || !apiMatch.awayTeam) return;
          const apiHomeTLA = apiMatch.homeTeam.tla || "";
          const apiAwayTLA = apiMatch.awayTeam.tla || "";
          const apiHomeName = (apiMatch.homeTeam.name || "").toLowerCase();
          const apiAwayName = (apiMatch.awayTeam.name || "").toLowerCase();
          
          if (!apiHomeTLA && !apiHomeName) return;
          
          const matchData = activeMatches.find(am => {
             const t1Arr = mapToApiTLA(am.team1);
             const t2Arr = mapToApiTLA(am.team2);
             const n1 = TEAMS[am.team1]?.name.toLowerCase() || "";
             const n2 = TEAMS[am.team2]?.name.toLowerCase() || "";
             
             // Match by TLA or Name
             const t1MatchesHome = t1Arr.includes(apiHomeTLA) || (apiHomeName && (apiHomeName.includes(n1) || n1.includes(apiHomeName)));
             const t2MatchesAway = t2Arr.includes(apiAwayTLA) || (apiAwayName && (apiAwayName.includes(n2) || n2.includes(apiAwayName)));
             
             const t1MatchesAway = t1Arr.includes(apiAwayTLA) || (apiAwayName && (apiAwayName.includes(n1) || n1.includes(apiAwayName)));
             const t2MatchesHome = t2Arr.includes(apiHomeTLA) || (apiHomeName && (apiHomeName.includes(n2) || n2.includes(apiHomeName)));
             
             return (t1MatchesHome && t2MatchesAway) || (t1MatchesAway && t2MatchesHome);
          });
          
          if (matchData) {
             const m = matchData.orig;
             const n1 = TEAMS[matchData.team1]?.name.toLowerCase() || "";
             const t1Arr = mapToApiTLA(matchData.team1);
             const isHomeT1 = t1Arr.includes(apiHomeTLA) || (apiHomeName && (apiHomeName.includes(n1) || n1.includes(apiHomeName)));
             
             let newStatus = "upcoming";
             if (apiMatch.status === "IN_PLAY" || apiMatch.status === "PAUSED" || apiMatch.status === "LIVE") newStatus = "live";
             if (apiMatch.status === "FINISHED") newStatus = "finished";
             
             if (newStatus === "upcoming" && m.status === "finished") {
                 newStatus = "finished";
             }
             
             const isStarted = newStatus !== "upcoming";
             let s1 = m.score1;
             let s2 = m.score2;
             
             let liveHome = apiMatch.score?.fullTime?.home;
             let liveAway = apiMatch.score?.fullTime?.away;
             
             if (liveHome === undefined || liveHome === null) {
                 liveHome = apiMatch.score?.regularTime?.home;
                 liveAway = apiMatch.score?.regularTime?.away;
             }
             if (liveHome === undefined || liveHome === null) {
                 liveHome = apiMatch.score?.halfTime?.home;
                 liveAway = apiMatch.score?.halfTime?.away;
             }
             
             if (isStarted && liveHome !== undefined && liveHome !== null) {
                 s1 = isHomeT1 ? liveHome : liveAway;
                 s2 = isHomeT1 ? liveAway : liveHome;
                 
                 if (apiMatch.score.duration === "PENALTY_SHOOTOUT" && apiMatch.score.penalties) {
                    const ap1 = isHomeT1 ? apiMatch.score.penalties.home : apiMatch.score.penalties.away;
                    const ap2 = isHomeT1 ? apiMatch.score.penalties.away : apiMatch.score.penalties.home;
                    s1 -= ap1;
                    s2 -= ap2;
                 }
             }
             
             let winner = null;
             let p1 = null;
             let p2 = null;
             if (newStatus === "finished" && apiMatch.score) {
                 if (apiMatch.score.winner === "HOME_TEAM") winner = isHomeT1 ? matchData.team1 : matchData.team2;
                 if (apiMatch.score.winner === "AWAY_TEAM") winner = isHomeT1 ? matchData.team2 : matchData.team1;
                 
                 if (apiMatch.score.duration === "PENALTY_SHOOTOUT" && apiMatch.score.penalties) {
                    p1 = isHomeT1 ? apiMatch.score.penalties.home : apiMatch.score.penalties.away;
                    p2 = isHomeT1 ? apiMatch.score.penalties.away : apiMatch.score.penalties.home;
                 }
             }
             
             if (s1 !== undefined && s1 !== null) {
                 state.simScores[m.id] = { t1Score: s1, t2Score: s2, pen1: p1, pen2: p2 };
             }

             if (m.status !== newStatus || m.score1 !== s1 || m.score2 !== s2 || m.penaltyScore1 !== p1 || m.penaltyScore2 !== p2 || m.winner !== winner) {
                m.status = newStatus;
                m.score1 = s1;
                m.score2 = s2;
                m.penaltyScore1 = p1;
                m.penaltyScore2 = p2;
                m.winner = winner;
                
                if (newStatus === "finished" && winner) {
                   matchData.roundObj[m.id] = winner;
                }
                
                changed = true;
             }
          }
        });
        
        if (changed) {
          try {
            localStorage.setItem('worldcup_live', JSON.stringify(MATCHES_R32));
          } catch(e) {}
          buildBracket();
        }
      } catch (err) {
        console.warn("API Fetch Error:", err);
        showToast("⚠️ Vercel API Error: Pastikan API Key tersimpan di Vercel, dan Repo tersinkronisasi!");
      }
    };
    
    // Fetch immediately, then every 10 seconds
    fetchAPI();
    setInterval(fetchAPI, 10000);
    
    document.addEventListener("visibilitychange", () => {
       if (document.visibilityState === "visible") fetchAPI();
    });
  }

  // ================================================================
  // INIT
  // ================================================================
  function init() {
    arenaEl = document.getElementById("arena");
    modalOverlay = document.getElementById("modal-overlay");
    toastEl = document.getElementById("toast");
    
    livePanel = document.getElementById("live-panel");
    liveFlag1 = document.getElementById("live-flag1");
    liveName1 = document.getElementById("live-name1");
    liveScore1 = document.getElementById("live-score1");
    liveFlag2 = document.getElementById("live-flag2");
    liveName2 = document.getElementById("live-name2");
    liveScore2 = document.getElementById("live-score2");
    liveMatchStatus = document.getElementById("live-match-status");
    livePanelTitle = document.getElementById("live-panel-title");

    try {
      const cached = localStorage.getItem('worldcup_live');
      if (cached) {
         const cachedMatches = JSON.parse(cached);
         MATCHES_R32.forEach(m => {
           const cm = cachedMatches.find(x => x.id === m.id);
           if (cm) {
             m.status = cm.status;
             m.score1 = cm.score1;
             m.score2 = cm.score2;
             m.penaltyScore1 = cm.penaltyScore1;
             m.penaltyScore2 = cm.penaltyScore2;
             m.winner = cm.winner;
           }
         });
      }
    } catch(e) {}

    document.getElementById("btn-reset")?.addEventListener("click", () => {
      state.picks = { r32: {}, r16: {}, qf: {}, sf: {}, f: {} };
      state.simScores = {};
      buildBracket();
      showToast("Bracket reset!");
    });
    
    // ================================================================
    // AUTO SIMULATION
    // ================================================================
    function calculateWinner(teamA, teamB) {
      if (!teamA || !teamB) return null;
      const ratingA = TEAMS[teamA]?.rating || 75;
      const ratingB = TEAMS[teamB]?.rating || 75;
      
      // Base probability 50% + difference in rating * 1.5%
      let probA = 0.5 + ((ratingA - ratingB) * 0.015);
      
      // Cap probabilities to ensure upsets are always possible (min 15%, max 85%)
      probA = Math.max(0.15, Math.min(0.85, probA));
      
      const random = Math.random();
      const winner = random <= probA ? teamA : teamB;
      
      let scoreW = Math.floor(Math.random() * 3) + 1; // 1, 2, 3
      let scoreL = Math.floor(Math.random() * scoreW); // 0 to scoreW-1

      let penW, penL;
      if (Math.random() < 0.15) { // 15% chance of penalties
         scoreW = Math.floor(Math.random() * 3); // 0, 1, 2
         scoreL = scoreW; // Draw
         penW = Math.floor(Math.random() * 2) + 4; // 4, 5
         penL = penW - 1 - Math.floor(Math.random() * 2); // 2, 3, 4
      }

      const score1 = winner === teamA ? scoreW : scoreL;
      const score2 = winner === teamA ? scoreL : scoreW;
      const pen1 = winner === teamA ? penW : penL;
      const pen2 = winner === teamA ? penL : penW;

      return { winner, score1, score2, pen1, pen2 };
    }

    async function runSimulation() {
      const simulateRound = async (matches, currentRing, stateObj, feedFromFunc) => {
        for (const match of matches) {
          if (currentRing === 0 && match.status === 'finished') continue; // Skip real finished matches
          if (stateObj[match.id]) continue; // Already picked

          let team1, team2;
          if (currentRing === 0) {
             team1 = match.team1;
             team2 = match.team2;
          } else {
             team1 = feedFromFunc(match.feedFrom[0]);
             team2 = feedFromFunc(match.feedFrom[1]);
          }

          if (!team1 || !team2) continue; // Waiting for previous rounds

          const result = calculateWinner(team1, team2);
          const winner = result.winner;
          
          state.simScores[match.id] = { t1Score: result.score1, t2Score: result.score2, pen1: result.pen1, pen2: result.pen2 };

          // Find the node in the UI and click it programmatically
          const sourceNode = currentGraph.nodes.find(n => n.ring === currentRing && n.team === winner);
          if (!sourceNode) continue;

          advanceTeam(sourceNode);
          
          // Wait for the CSS flying animation (700-800ms) + small buffer to finish
          // This MUST be > 800ms, otherwise the state isn't updated in time for the next round!
          await new Promise(r => setTimeout(r, 850));
        }
      };

      const getR32Winner = (id) => state.picks.r32[id] || MATCHES_R32.find(m => m.id === id)?.winner;
      const getR16Winner = (id) => state.picks.r16[id];
      const getQFWinner = (id) => state.picks.qf[id];
      const getSFWinner = (id) => state.picks.sf[id];

      await simulateRound(MATCHES_R32, 0, state.picks.r32, null);
      await simulateRound(R16_BRACKET, 1, state.picks.r16, getR32Winner);
      await simulateRound(QF_BRACKET, 2, state.picks.qf, getR16Winner);
      await simulateRound(SF_BRACKET, 3, state.picks.sf, getQFWinner);
      
      // For Final, wait a bit longer to enjoy the confetti
      await simulateRound(F_BRACKET, 4, state.picks.f, getSFWinner);
      await new Promise(r => setTimeout(r, 1000));
    }

    document.getElementById("btn-simulate")?.addEventListener("click", () => {
      runSimulation();
    });

    let resizeTimer;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(buildBracket, 200);
    });

    buildBracket();
    fetchLiveScores();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
