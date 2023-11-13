import { CdkDragEnd } from '@angular/cdk/drag-drop';
import { Component, OnChanges, OnInit } from '@angular/core';

import * as d3 from "d3"
import { EmbbedApiService } from 'src/app/_services/embbedapi.service';

@Component({
  selector: 'app-workflows',
  templateUrl: './workflows.component.html',
  styleUrls: ['./workflows.component.scss']
})
export class WorkflowsComponent implements OnInit, OnChanges {

  models: string[] = []

  selected_class: string = ""
  tabIndex: number = 1

  color: { type: string, color: string }[] = []
  w = 10
  h = 10

  selected_classes: string[] = ["core\\User"]

  suits = [{ "source": "Microsoft", "target": "Amazon", "type": "licensing" }, { "source": "Microsoft", "target": "HTC", "type": "licensing" }, { "source": "Samsung", "target": "Apple", "type": "suit" }, { "source": "Motorola", "target": "Apple", "type": "suit" }, { "source": "Nokia", "target": "Apple", "type": "resolved" }, { "source": "HTC", "target": "Apple", "type": "suit" }, { "source": "Kodak", "target": "Apple", "type": "suit" }, { "source": "Microsoft", "target": "Barnes & Noble", "type": "suit" }, { "source": "Microsoft", "target": "Foxconn", "type": "suit" }, { "source": "Oracle", "target": "Google", "type": "suit" }, { "source": "Apple", "target": "HTC", "type": "suit" }, { "source": "Microsoft", "target": "Inventec", "type": "suit" }, { "source": "Samsung", "target": "Kodak", "type": "resolved" }, { "source": "LG", "target": "Kodak", "type": "resolved" }, { "source": "RIM", "target": "Kodak", "type": "suit" }, { "source": "Sony", "target": "LG", "type": "suit" }, { "source": "Kodak", "target": "LG", "type": "resolved" }, { "source": "Apple", "target": "Nokia", "type": "resolved" }, { "source": "Qualcomm", "target": "Nokia", "type": "resolved" }, { "source": "Apple", "target": "Motorola", "type": "suit" }, { "source": "Microsoft", "target": "Motorola", "type": "suit" }, { "source": "Motorola", "target": "Microsoft", "type": "suit" }, { "source": "Huawei", "target": "ZTE", "type": "suit" }, { "source": "Ericsson", "target": "ZTE", "type": "suit" }, { "source": "Kodak", "target": "Samsung", "type": "resolved" }, { "source": "Apple", "target": "Samsung", "type": "suit" }, { "source": "Kodak", "target": "RIM", "type": "suit" }, { "source": "Nokia", "target": "Qualcomm", "type": "suit" }]
  test: { source: string, target: string, type: string }[] = []

  constructor(
    private api: EmbbedApiService
  ) { }

  async ngOnInit() {
    this.models = await this.api.listAllModels()
    this.selected_classes = this.models.filter(item => item.startsWith("finance"))
    d3.select("figure#test").append("svg")
    d3.select("#test > svg").attr("class", "full")
    this.test = await this.createSet()
    console.log(this.test)
    this.color = this.chart()
    console.log(this.color)

  }

  ngOnChanges() {
    console.log("CALLED")
    this.chart()
  }

  dragoff(event: CdkDragEnd) {
    console.log(event)
  }


  async createSet(): Promise<{ source: string, target: string, type: string }[]> {
    let set: { source: string, target: string, type: string }[] = []
    for (let model of this.selected_classes) {
      let scheme = await this.api.getSchema(model)
      for (let field in scheme['fields']) {
        if (field === "creator" || field === "modifier") continue
        if (["many2many", "many2one", "one2many"].includes(scheme['fields'][field].type)) {
          set.push({ "source": model, "target": scheme['fields'][field].foreign_object, "type": scheme['fields'][field].type })
        }
      }
      if (scheme.parent !== 'equal\\orm\\Model') {
        set.push({ "source": model, "target": scheme.parent, "type": "Extended" })
      }
    }
    return set
  }

  chart() {
    const svg = d3.select("#test > svg")

    //@ts-expect-error
    let size = d3.select("figure#test").node().getBoundingClientRect()
    console.log(size)
    const width = size.width;
    const height = size.height;
    const types = Array.from(new Set(this.test.map(d => d.type)));
    let nodes_names = [...this.selected_classes, ...new Set(this.test.flatMap(l => [l.source, l.target]))]
    const nodes = Array.from(nodes_names.filter((e, i) => nodes_names.indexOf(e) === i), id => ({ id }));

    const links = this.test.map(d => Object.create(d))

    const color = d3.scaleOrdinal(types, d3.schemeCategory10);
    // @ts-expect-error
    const simulation = d3.forceSimulation(nodes)
      // @ts-expect-error
      .force("link", d3.forceLink(links).id(d => d.id))
      .force("charge", d3.forceManyBody().strength(-1000))
      .force("x", d3.forceX())
      .force("y", d3.forceY());


    svg.attr("viewBox", [-width / 2, -height / 2, width, height])
      .attr("width", width)
      .attr("height", height)
      .attr("style", "max-width: 100%; height: auto; font: 12px sans-serif;");


    // Per-type markers, as they don't inherit styles.
    svg.append("defs").selectAll("marker")
      .data(types)
      .join("marker")
      .attr("id", d => `arrow-${d}`)
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 15)
      .attr("refY", -0.5)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("path")
      .attr("fill", color)
      .attr("d", "M0,-5L10,0L0,5");

    const link = svg.append("g")
      .attr("fill", "none")
      .attr("stroke-width", 1.5)
      .selectAll("path")
      .data(links)
      .join("path")
      .attr("stroke", d => color(d.type))
    //.attr("marker-start", d => `url(${new URL(`#arrow-${d.type}`, location)})`)
    //.attr("marker-end", d => `url(${new URL(`#arrow-${d.type}`, location)})`)

    const node = svg.append("g")
      .attr("fill", "currentColor")
      .attr("stroke-linecap", "round")
      .attr("stroke-linejoin", "round")
      .selectAll("g")
      .data(nodes)
      .join("g")
      // @ts-expect-error
      .call(this.drag(simulation));

    node.append("circle")
      .attr("stroke", "white")
      .attr("stroke-width", 1.5)
      .attr("r", 5);

    node.append("text")
      .attr("x", 8)
      .attr("y", "0.31em")
      .text(d => d.id)
      .clone(true).lower()
      .attr("fill", "none")
      .attr("stroke", "white")
      .attr("stroke-width", 3);

    simulation.on("tick", () => {
      link.attr("d", this.linkArc);
      // @ts-expect-error
      node.attr("transform", d => `translate(${d.x},${d.y})`);
    });

    // ts-expect-error
    //invalidation.then(() => simulation.stop());
    let ret: { type: string, color: string }[] = []
    types.forEach(type => ret.push({ type: type, color: color(type) }))
    return ret
  }

  drag = (simulation: any) => {

    function dragstarted(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event: any, d: any) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    return d3.drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended);
  }

  linkArc(d: any) {
    const r = Math.hypot(d.target.x - d.source.x, d.target.y - d.source.y);
    return `
      M${d.source.x},${d.source.y}
      A${r},${r} 0 0,1 ${d.target.x},${d.target.y}
    `;
  }


  async addOne() {
    this.selected_classes.push(this.selected_class)
    this.selected_class = ""
    this.test = await this.createSet()
    d3.select("#test > svg").remove()
    d3.select("figure#test").append("svg")
    d3.select("#test > svg").attr("class", "full")
    this.color = this.chart()
  }
}
