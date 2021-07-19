import { AfterViewInit, Component, ViewChild } from '@angular/core';
import Konva from 'konva';
import { Router } from '@angular/router';
import { LabelService } from '../services/label/label.service';
import { Camera, CameraResultType } from '@capacitor/camera';
import { CameraSource } from '@capacitor/camera/dist/esm/definitions';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: [ 'tab1.page.scss' ]
})
export class Tab1Page implements AfterViewInit {
  @ViewChild('content') content: any;
  stage: Konva.Stage;
  layer: Konva.Layer;
  textNode: Konva.Text | any;
  tr: Konva.Transformer;
  height = 0;

  constructor(private router: Router,
              private label: LabelService) {
  }

  ionViewWillEnter(): void {
    if (this.stage) {
      this.toggleTextControls(true);
    }
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.height = this.content.el.clientHeight;
      this.build(this.height);
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

    this.stage = new Konva.Stage({
      container: 'container',
      width: 1280, // FIXME 1028
      height: 1280, // FIXME 1028
    });

    this.layer = new Konva.Layer();
    this.stage.add(this.layer);

    const size = width > height ? height : width;
    this.stage.scale({x: size / 1280, y: size / 1280});
    this.stage.draw();

    // Moldura
    Konva.Image.fromURL('/assets/moldura-2.png', (mockup) => {
      mockup.setZIndex(100); // FIXME

      mockup.setAttrs({
        id: 'canvas-moldura',
        listening: false
      });

      mockup.setZIndex(100);

      this.layer.add(mockup);
    });

    // Texto
    this.textNode = new Konva.Text({
      x: this.stage.width() / 2,
      y: (height / 2) - 15,
      text: 'Simple Text',
      fontSize: 120,
      fontFamily: 'Calibri',
      fill: 'green',
      draggable: true,
      align: 'center',
    });

    // to align text in the middle of the screen, we can set the
    // shape offset to the center of the text shape after instantiating it
    this.textNode.offsetX(this.textNode.width() / 2);

    this.tr = new Konva.Transformer({
      node: this.textNode,
      enabledAnchors: [ 'middle-left', 'middle-right' ],
      // set minimum width of text
      boundBoxFunc: (oldBox, newBox) => {
        newBox.width = Math.max(30, newBox.width);
        return newBox;
      },
    });

    this.textNode.on('transform', () => {
      // reset scale, so only with is changing by transformer
      this.textNode.setAttrs({
        width: this.textNode.width() * this.textNode.scaleX(),
        scaleX: 1,
      });
    });

    this.textNode.on('dblclick dbltap', () => {
      this.textNode.setAttrs({
        text: 'Example text',
        fontSize: 200,
        fill: 'red',
      });

      const PATH = 'M 0 300 a 300 300 0 1 1 1 0';
      const text = new Konva.TextPath({
        x: 600,
        y: 600,
        fill: 'orange',
        textBaseline: 'bottom',
        fontSize: 150,
        fontFamily: 'Calibri',
        text: 'SOME TEXT',
        align: 'center',
        data: PATH,
        draggable: true,
      });

      this.layer.add(text);
    });

    // After images load
    setTimeout(() => {
      this.layer.add(this.textNode);
      this.layer.add(this.tr);
    }, 3000);

    // PINCH
    let lastDist = 0;
    let activeShape = null;

    function getDistance(p1, p2) {
      return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
    }

    this.stage.on('tap', function (evt) {
      // set active shape
      const shape = evt.target;
      activeShape =
        activeShape && activeShape.getName() === shape.name()
          ? null
          : shape;
    });

    this.stage.getContent().addEventListener(
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

    this.stage.getContent().addEventListener(
      'touchend',
      function () {
        lastDist = 0;
      },
      false
    );

    this.stage.add(this.layer);
  }

  toggleTextControls(enable = true): void {
    if (enable) {
      this.textNode.setAttrs({
        draggable: true,
      });

      this.layer.add(this.tr);
    } else {
      this.textNode.setAttrs({
        draggable: false,
      });
      this.tr.remove();
    }
  }

  refresh(): void {
    location.reload();
  }

  async redirect(): Promise<any> {
    const width = window.innerWidth;
    const {height} = this;

    this.toggleTextControls(false);

    /**
     * TODO
     *  Rótulo: 1028x1028
     *  Moldura: 1280x1280
     */

    this.stage.scale({x: 1, y: 1});
    this.stage.draw();
    const base64 = this.stage.toDataURL();
    this.label.label.next(base64);
    await this.router.navigate([ '/tabs', 'tab2' ]);
    const size = width > height ? height : width;
    this.stage.scale({x: size / 1280, y: size / 1280});
    this.stage.draw();
  }

  async upload(): Promise<any> {
    const image = await Camera.getPhoto({
      quality: 90,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Photos
    });

    const {dataUrl} = image;

    this.addImageToCanvas(dataUrl);
  }

  /*
   * Imagem do usuário selecionando do celular.
   */
  addImageToCanvas(path = '') {
    if (!path) {
      return;
    }

    const width = window.innerWidth;
    const {height} = this;

    const img = new Image();
    // img.crossOrigin = 'Anonymous';
    img.src = path;
    img.onload = () => {
      const image = new Konva.Image({
        x: (width / 2) - (img.width / 2),
        y: (height / 2) - (img.height / 2),
        image: img,
        draggable: true
      });

      this.layer.add(image);
      image.image(img);
      image.setZIndex(0);
      this.stage.draw();
    };
  }

}
