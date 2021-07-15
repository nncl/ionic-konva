import { Component, OnInit } from '@angular/core';
import Konva from 'konva';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: [ 'tab1.page.scss' ]
})
export class Tab1Page implements OnInit {

  constructor() {
  }

  ngOnInit(): void {
    this.build();
  }

  build(): void {
    const stage = new Konva.Stage({
      container: 'container',
      width: window.innerWidth,
      height: window.innerHeight,
    });

    // add canvas element
    const layer = new Konva.Layer();
    stage.add(layer);

    // create shape
    const box = new Konva.Rect({
      x: 50,
      y: 50,
      width: 100,
      height: 50,
      fill: '#00D2FF',
      stroke: 'black',
      strokeWidth: 4,
      draggable: true,
    });

    layer.add(box);

    // add cursor styling
    box.on('mouseover', () => {
      document.body.style.cursor = 'pointer';
    });
    box.on('mouseout', () => {
      document.body.style.cursor = 'default';
    });
  }

}
