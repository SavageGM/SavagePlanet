Hooks.once("init", () => console.log("Savage Planet Engineering | v0.1 test initializing"));

class SPEngineeringConsole extends Application {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      id: "sp-engineering",
      title: "Savage Planet Engineering v0.1",
      template: "modules/savage-planet-engineering/templates/console.hbs",
      width: 680,
      height: "auto",
      resizable: true
    });
  }

  constructor(actor) { super(); this.actor = actor; }
  getData() { return { actorName: this.actor?.name ?? "No actor selected" }; }

  activateListeners(html) {
    super.activateListeners(html);
    const form = html.find("form")[0];
    const calc = () => this.calculate(form);
    html.find("form").on("input change", calc);
    html.find("[data-action=roll]").on("click", async ev => { ev.preventDefault(); await this.roll(form); });
    calc();
  }

  values(form) { return Object.fromEntries(new FormData(form).entries()); }

  tlMod(tl, ss) {
    const m = {0:4,1:4,2:4,3:4,4:4,5:3,6:2,7:1,8:0,9:-3,10:-6,11:-9,12:-12}[tl] ?? -12;
    return m + (ss ? -5 : 0);
  }

  repairValueMod(v) { return v <= 1000 ? 1 : v <= 10000 ? 0 : v <= 100000 ? -1 : v <= 1000000 ? -2 : -3; }

  partsMod(have, need, minor=false) {
    if (!need) return 0;
    const r = have / need;
    if (r >= 30) return 5; if (r >= 15) return 4; if (r >= 8) return 3;
    if (r >= 4) return 2; if (r >= 2) return 1; if (r >= 1 || minor) return 0;
    if (r < .1) return null;
    return -Math.ceil((1-r)*10 - 1e-9);
  }

  projectMod(value, type, kind) {
    const rows = [
      [10,[-2,-7],[2,-2],[6,3]], [100,[-4,-9],[1,-3],[5,2]],
      [1000,[-6,-11],[-1,-5],[4,1]], [10000,[-8,-13],[-2,-6],[3,0]],
      [100000,[-10,-15],[-4,-8],[2,-1]], [1000000,[-12,-17],[-5,-9],[1,-2]],
      [2000000,[-14,-19],[-7,-11],[0,-3]], [3000000,[-16,-21],[-8,-12],[-1,-4]]
    ];
    const row = rows.find(r => value <= r[0]) ?? rows.at(-1);
    const pair = row[{inventor:1,gadgeteer:2,quick:3}[kind]];
    return type === "invent" ? pair[1] : pair[0];
  }

  calculate(form) {
    const s=this.values(form), type=s.type, kind=s.kind, value=Number(s.value)||0, skill=Number(s.skill)||0, tl=Number(s.tl)||8;
    const major=s.major==="on", have=Number(s.parts)||0;
    const need = type === "repair" ? (major ? value*(Number(s.majorRoll)||1)*.1 : value*.05) : value*({inventor:1,gadgeteer:.3,quick:.1}[kind]??1);
    const pm=this.partsMod(have,need,type==="repair"&&!major);
    const base=type==="repair" ? this.repairValueMod(value)+(major?-2:0) : this.projectMod(value,type,kind);
    const facility=type==="repair" ? ({proper:0,improper:-5,none:-10}[s.tools]??0) : Number(s.workspace)||0;
    const tm=this.tlMod(tl,s.superscience==="on");
    const target=skill+base+facility+tm+(pm??-99)+Number(s.other||0);
    form.dataset.target=target;
    form.querySelector("[data-output]").innerHTML = `<strong>${pm===null?"Insufficient parts":`Effective Skill ${target}`}</strong><br>Project ${base>=0?"+":""}${base}; TL ${tm>=0?"+":""}${tm}; Workspace/Tools ${facility>=0?"+":""}${facility}; Parts ${pm===null?"<10%":(pm>=0?"+":"")+pm}<br>Required parts: $${Math.round(need).toLocaleString()}`;
  }

  async roll(form) {
    const s=this.values(form), target=Number(form.dataset.target);
    if (target < -20) return ui.notifications.warn("At least 10% of required parts are needed.");
    const roll=await new Roll("3d6").evaluate();
    const margin=target-roll.total;
    await roll.toMessage({speaker:ChatMessage.getSpeaker({actor:this.actor}), flavor:`<h3>Savage Planet Engineering</h3><p>${s.type.toUpperCase()} — Target ${target}</p><p><b>${margin>=0?`Success by ${margin}`:`Failure by ${-margin}`}</b></p>${s.type==="repair"&&margin>=0?`<p>Restore ${Math.max(1,margin)} HP</p>`:""}`});
  }
}

Hooks.once("ready", () => {
  game.savagePlanetEngineering = { open: actor => new SPEngineeringConsole(actor ?? canvas.tokens.controlled[0]?.actor ?? game.user.character).render(true) };
});

Hooks.on("getSceneControlButtons", controls => {
  const token = controls.find(c => c.name === "token");
  if (!token) return;
  token.tools.push({name:"sp-engineering",title:"Savage Planet Engineering",icon:"fas fa-screwdriver-wrench",button:true,onClick:()=>game.savagePlanetEngineering.open()});
});