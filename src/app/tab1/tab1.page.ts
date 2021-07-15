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

    Konva.hitOnDragEnabled = true;

    /**
     * 1. Imagem = camada interna
     * 2. Moldura
     * 3. Texto
     */

    const width = window.innerWidth;
    const height = window.innerHeight;

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
      userImage.setAttrs({
        x: 0,
        y: 0,
        width: 280,
        height: 280,
        draggable: true
      });
      layer.add(userImage);
    });

    // Moldura
    Konva.Image.fromURL('/assets/moldura.png', (mockup) => {
      mockup.setAttrs({
        x: 0,
        y: 0,
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
      y: 15,
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
      return;
      // hide text node and transformer:
      textNode.hide();
      tr.hide();

      // create textarea over canvas with absolute position
      // first we need to find position for textarea
      // how to find it?

      // at first lets find position of text node relative to the stage:
      var textPosition = textNode.absolutePosition();

      // so position of textarea will be the sum of positions above:
      var areaPosition = {
        x: stage.container().offsetLeft + textPosition.x,
        y: stage.container().offsetTop + textPosition.y,
      };

      // create textarea and style it
      var textarea = document.createElement('textarea');
      document.body.appendChild(textarea);

      // apply many styles to match text on canvas as close as possible
      // remember that text rendering on canvas and on the textarea can be different
      // and sometimes it is hard to make it 100% the same. But we will try...
      textarea.value = textNode.text();
      textarea.style.position = 'absolute';
      textarea.style.top = areaPosition.y + 'px';
      textarea.style.left = areaPosition.x + 'px';
      textarea.style.width = textNode.width() - textNode.padding() * 2 + 'px';
      textarea.style.height =
        textNode.height() - textNode.padding() * 2 + 5 + 'px';
      textarea.style.fontSize = textNode.fontSize() + 'px';
      textarea.style.border = 'none';
      textarea.style.padding = '0px';
      textarea.style.margin = '0px';
      textarea.style.overflow = 'hidden';
      textarea.style.background = 'none';
      textarea.style.outline = 'none';
      textarea.style.resize = 'none';
      textarea.style.lineHeight = textNode.lineHeight();
      textarea.style.fontFamily = textNode.fontFamily();
      textarea.style.transformOrigin = 'left top';
      textarea.style.textAlign = textNode.align();
      textarea.style.color = textNode.fill();
      let rotation = textNode.rotation();
      var transform = '';
      if (rotation) {
        transform += 'rotateZ(' + rotation + 'deg)';
      }

      var px = 0;
      // also we need to slightly move textarea on firefox
      // because it jumps a bit
      var isFirefox =
        navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
      if (isFirefox) {
        px += 2 + Math.round(textNode.fontSize() / 20);
      }
      transform += 'translateY(-' + px + 'px)';

      textarea.style.transform = transform;

      // reset height
      textarea.style.height = 'auto';
      // after browsers resized it we can set actual value
      textarea.style.height = textarea.scrollHeight + 3 + 'px';

      textarea.focus();

      function removeTextarea() {
        textarea.parentNode.removeChild(textarea);
        window.removeEventListener('click', handleOutsideClick);
        textNode.show();
        tr.show();
        tr.forceUpdate();
      }

      function setTextareaWidth(newWidth) {
        if (!newWidth) {
          // set width for placeholder
          newWidth = textNode.placeholder.length * textNode.fontSize();
        }
        // some extra fixes on different browsers
        var isSafari = /^((?!chrome|android).)*safari/i.test(
          navigator.userAgent
        );
        if (isSafari) {
          newWidth = Math.ceil(newWidth);
        }

        // var isEdge =
        //   document.documentMode || /Edge/.test(navigator.userAgent);
        // if (isEdge) {
        //   newWidth += 1;
        // }
        textarea.style.width = newWidth + 'px';
      }

      textarea.addEventListener('keydown', function (e) {
        // hide on enter
        // but don't hide on shift + enter
        if (e.keyCode === 13 && !e.shiftKey) {
          textNode.text(textarea.value);
          removeTextarea();
        }
        // on esc do not set value back to node
        if (e.keyCode === 27) {
          removeTextarea();
        }
      });

      textarea.addEventListener('keydown', function (e) {
        let scale = textNode.getAbsoluteScale().x;
        setTextareaWidth(textNode.width() * scale);
        textarea.style.height = 'auto';
        textarea.style.height =
          textarea.scrollHeight + textNode.fontSize() + 'px';
      });

      function handleOutsideClick(e) {
        if (e.target !== textarea) {
          textNode.text(textarea.value);
          removeTextarea();
        }
      }

      setTimeout(() => {
        window.addEventListener('click', handleOutsideClick);
      });
    });

    textNode.on('tap', () => {
      console.log('tapppp'); // FIXME
    });

    setTimeout(() => {
      layer.add(textNode);
      layer.add(tr);
    }, 3000);

    // TODO
    // setTimeout(() => {
    //   tr.remove();
    // }, 10000);
    //
    // setTimeout(() => {
    //   layer.add(tr);
    // }, 12000);

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

}
