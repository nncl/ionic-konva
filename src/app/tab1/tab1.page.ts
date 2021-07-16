import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import Konva from 'konva';
import { IonContent } from '@ionic/angular';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: [ 'tab1.page.scss' ]
})
export class Tab1Page implements AfterViewInit {
  @ViewChild('content') content: any;

  constructor() {
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      const height = this.content.el.clientHeight;
      this.build(height);
    }, 1000);
  }

  build(height = 0): void {

    Konva.hitOnDragEnabled = true;

    /**
     * 1. Imagem = camada interna
     * 2. Moldura
     * 3. Texto
     */

    const width = window.innerWidth;
    // const height = window.innerHeight;

    const stage = new Konva.Stage({
      container: 'container',
      width,
      height,
    });

    const layer = new Konva.Layer();
    stage.add(layer);

    /*
     * Imagem do usuário selecionando do celular
     * TODO Verificar se deixaremos a imagem com tamanho original ou
     *  se setaremos a largura máxima da viewport e a altura de forma
     *  dinâmica.
     */
    Konva.Image.fromURL('https://dummyimage.com/300x800', (userImage) => {
      const {width: imgWidth = 0, height: imgHeight = 0} = userImage?.attrs?.image || {};

      userImage.setAttrs({
        x: (width / 2) - (imgWidth / 2),
        y: (height / 2) - (imgHeight / 2),
        draggable: true
      });
      layer.add(userImage);
    });

    // Moldura
    Konva.Image.fromURL('/assets/moldura.png', (mockup) => {
      mockup.setAttrs({
        x: (width / 2) - 140,
        y: (height / 2) - 140,
        width: 280,
        height: 280,
        id: 'canvas-moldura',
        listening: false
      });
      layer.add(mockup);
    });

    // Texto
    var textNode: any = new Konva.Text({
      x: stage.width() / 2,
      y: (height / 2) - 15,
      text: 'Simple Text',
      fontSize: 30,
      fontFamily: 'Calibri',
      fill: 'green',
      draggable: true,
      align: 'center',
    });

    // TODO
    // to align text in the middle of the screen, we can set the
    // shape offset to the center of the text shape after instantiating it
    textNode.offsetX(textNode.width() / 2);

    var tr = new Konva.Transformer({
      node: textNode,
      enabledAnchors: [ 'middle-left', 'middle-right' ],
      // set minimum width of text
      boundBoxFunc: function (oldBox, newBox) {
        newBox.width = Math.max(30, newBox.width);
        return newBox;
      },
    });

    textNode.on('transform', function () {
      // reset scale, so only with is changing by transformer
      textNode.setAttrs({
        width: textNode.width() * textNode.scaleX(),
        scaleX: 1,
      });
    });

    textNode.on('dblclick dbltap', () => {
      textNode.setAttrs({
        text: 'Example text',
        fontSize: 60,
        fill: 'red',
      });
    });

    setTimeout(() => {
      layer.add(textNode);
      layer.add(tr);
    }, 3000);

    // PINCH
    let lastDist = 0;
    let activeShape = null;

    function getDistance(p1, p2) {
      return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
    }

    // TODO center?
    // const stage = new Konva.Stage({
    //   container: 'container',
    //   width: width,
    //   height: height,
    //   draggable: true,
    //   x: width / 2,
    //   y: height / 2,
    //   offset: {
    //     x: width / 2,
    //     y: height / 2,
    //   },
    // });

    stage.on('tap', function (evt) {
      // set active shape
      const shape = evt.target;
      activeShape =
        activeShape && activeShape.getName() === shape.name()
          ? null
          : shape;
    });

    stage.getContent().addEventListener(
      'touchmove',
      function (evt) {
        const touch1 = evt.touches[0];
        const touch2 = evt.touches[1];

        if (touch1 && touch2 && activeShape) {
          const dist = getDistance(
            {
              x: touch1.clientX,
              y: touch1.clientY,
            },
            {
              x: touch2.clientX,
              y: touch2.clientY,
            }
          );

          if (!lastDist) {
            lastDist = dist;
          }

          const scale = (activeShape.scaleX() * dist) / lastDist;

          activeShape.scaleX(scale);
          activeShape.scaleY(scale);
          lastDist = dist;
        }
      },
      false
    );

    stage.getContent().addEventListener(
      'touchend',
      function () {
        lastDist = 0;
      },
      false
    );

    stage.add(layer);
  }

  refresh(): void {
    location.reload();
  }

}
