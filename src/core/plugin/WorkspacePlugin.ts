/*
 * @Author: 秦少卫
 * @Date: 2023-06-27 12:26:41
 * @LastEditors: 秦少卫
 * @LastEditTime: 2023-11-19 21:05:33
 * @Description: 画布区域插件
 */

import { fabric } from 'fabric';
import Editor from '../core';
import { throttle } from 'lodash-es';
import { v4 as uuid } from 'uuid';
import spiralBinding from '../../assets/spiral-binding.svg';
type IEditor = Editor;

class WorkspacePlugin {
  public canvas: fabric.Canvas;
  public editor: IEditor;
  static pluginName = 'WorkspacePlugin';
  static events = ['sizeChange'];
  static apis = ['big', 'small', 'auto', 'one', 'setSize'];
  workspaceEl: HTMLElement;
  workspace: null | fabric.Rect;
  option: any;
  constructor(canvas: fabric.Canvas, editor: IEditor) {
    this.canvas = canvas;
    this.editor = editor;
    const a4Width = 2550; // pixels
    const a4Height = 1650; // pixels
    // Fabric.js canvas dimensions
    const canvasWidth = this.canvas.getWidth(); // Get the width of the Fabric.js canvas

    // Calculate the corresponding height to maintain aspect ratio
    const canvasHeight = (a4Height / a4Width) * canvasWidth;

    this.init({
      width: 3300,
      height: 2550,
    });
  }

  init(option) {
    const workspaceEl = document.querySelector('#workspace') as HTMLElement;
    if (!workspaceEl) {
      throw new Error('element #workspace is missing, plz check!');
    }
    this.workspaceEl = workspaceEl;
    this.workspace = null;
    this.option = option;
    this._initBackground();
    this._initWorkspace();
    this._initResizeObserve();
    this._bindWheel();
  }

  // hookImportBefore() {
  //   return new Promise((resolve, reject) => {
  //     resolve();
  //   });
  // }

  hookImportAfter() {
    return new Promise((resolve) => {
      const workspace = this.canvas.getObjects().find((item) => item.id === 'workspace');
      if (workspace) {
        workspace.set('selectable', false);
        workspace.set('hasControls', false);
        this.setSize(workspace.width, workspace.height);
        this.editor.emit('sizeChange', workspace.width, workspace.height);
      }
      resolve();
    });
  }

  hookSaveAfter() {
    return new Promise((resolve) => {
      this.auto();
      resolve(true);
    });
  }

  // 初始化背景
  _initBackground() {
    this.canvas.backgroundImage = '';
    this.canvas.setWidth(this.workspaceEl.offsetWidth); // Set the canvas width to be twice the actual size
    this.canvas.setHeight(this.workspaceEl.offsetHeight);
  }

  // 初始化画布
  _initWorkspace() {
    const { width, height } = this.option;
    // Create a red rectangle with rounded corners slightly larger than the workspace
    const backgroundRect = new fabric.Rect({
      fill: 'red',
      width: width + 20, // Add 20px to width and height for a bigger size
      height: height + 20,
      rx: 20, // Set rounded corners with radius 20px
      ry: 20,
      selectable: false,
      hasControls: false,
      hoverCursor: 'default',
    });

    // Add the background rectangle to the canvas behind the workspace
    this.canvas.add(backgroundRect);

    const workspace = new fabric.Rect({
      fill: 'rgba(255,255,255,1)',
      width: width,
      height,
      id: 'workspace',
      stroke: '#E0E3EC',
      strokeWidth: 80,
      rx: 30,
      ry: 30,
    });
    workspace.set('selectable', false);
    workspace.set('hasControls', false);
    workspace.hoverCursor = 'default';
    this.canvas.add(workspace);

    // Add tabs
    const tabWidth = 60;
    const tabHeight = 200;
    const numberOfTabs = 11;
    for (let i = 0; i < numberOfTabs; i++) {
      const tab = new fabric.Rect({
        fill: 'red', // Make the color red
        width: tabWidth,
        height: tabHeight,
        left: workspace.width - tabWidth + 20, // Position the tab on the right side but inside the workspace
        top: i * (tabHeight + 10), // Position the tabs vertically with a 10px gap
        id: `tabsRect-${uuid()}`,
      });
      // Do not set 'selectable' and 'hasControls' to false
      this.canvas.add(tab);
    }

    // Add a gap in the center of the workspace
    const gapWidth = 80; // Adjust this to change the width of the gap
    const gap = new fabric.Rect({
      fill: 'transparent', // Make the gap transparent
      stroke: '#E0E3EC', // Same border as the workspace
      strokeWidth: 20,
      width: gapWidth,
      height: height,
      left: (width - gapWidth) / 2, // Position the gap in the center of the workspace
      id: 'gapRect',
    });
    gap.set('selectable', false);
    gap.set('hasControls', false);
    this.canvas.add(gap);

    // Add the spiral binding SVG
    fabric.Image.fromURL(spiralBinding, (img) => {
      // Scale the image to fit the height of the workspace
      const scale = height / img.height;
      img.scale(scale);

      img.set({
        left: (width - img.getScaledWidth()) / 2, // Position the image in the center of the workspace
        top: 0, // Position the image at the top of the workspace
      });
      this.canvas.add(img);
      this.canvas.bringToFront(img); // Make sure the image is on top of the gapRect
    });

    this.canvas.renderAll();
    this.workspace = workspace;
    this.auto();
  }

  /**
   * 设置画布中心到指定对象中心点上
   * @param {Object} obj 指定的对象
   */
  setCenterFromObject(obj: fabric.Rect) {
    const { canvas } = this;
    const objCenter = obj.getCenterPoint();
    const viewportTransform = canvas.viewportTransform;
    if (canvas.width === undefined || canvas.height === undefined || !viewportTransform) return;
    viewportTransform[4] = canvas.width / 2 - objCenter.x * viewportTransform[0];
    viewportTransform[5] = canvas.height / 2 - objCenter.y * viewportTransform[3];
    canvas.setViewportTransform(viewportTransform);
    canvas.renderAll();
  }

  // 初始化监听器
  _initResizeObserve() {
    const resizeObserver = new ResizeObserver(
      throttle(() => {
        this.auto();
      }, 50)
    );
    resizeObserver.observe(this.workspaceEl);
  }

  setSize(width: number, height: number) {
    this._initBackground();
    this.option.width = width;
    this.option.height = height;
    // 重新设置workspace
    this.workspace = this.canvas
      .getObjects()
      .find((item) => item.id === 'workspace') as fabric.Rect;
    this.workspace.set('width', width);
    this.workspace.set('height', height);
    this.auto();
  }

  setZoomAuto(scale: number, cb?: (left?: number, top?: number) => void) {
    const { workspaceEl } = this;
    const width = workspaceEl.offsetWidth;
    const height = workspaceEl.offsetHeight;
    this.canvas.setWidth(width);
    this.canvas.setHeight(height);
    const center = this.canvas.getCenter();
    this.canvas.setViewportTransform(fabric.iMatrix.concat());
    this.canvas.zoomToPoint(new fabric.Point(center.left, center.top), scale);
    if (!this.workspace) return;
    this.setCenterFromObject(this.workspace);

    // 超出画布不展示
    this.workspace.clone((cloned: fabric.Rect) => {
      this.canvas.clipPath = cloned;
      this.canvas.requestRenderAll();
    });
    if (cb) cb(this.workspace.left, this.workspace.top);
  }

  _getScale() {
    const viewPortWidth = this.workspaceEl.offsetWidth;
    const viewPortHeight = this.workspaceEl.offsetHeight;
    // 按照宽度
    if (viewPortWidth / viewPortHeight < this.option.width / this.option.height) {
      return viewPortWidth / this.option.width;
    } // 按照宽度缩放
    return viewPortHeight / this.option.height;
  }

  // 放大
  big() {
    let zoomRatio = this.canvas.getZoom();
    zoomRatio += 0.05;
    const center = this.canvas.getCenter();
    this.canvas.zoomToPoint(new fabric.Point(center.left, center.top), zoomRatio);
  }

  // 缩小
  small() {
    let zoomRatio = this.canvas.getZoom();
    zoomRatio -= 0.05;
    const center = this.canvas.getCenter();
    this.canvas.zoomToPoint(
      new fabric.Point(center.left, center.top),
      zoomRatio < 0 ? 0.01 : zoomRatio
    );
  }

  // 自动缩放
  auto() {
    const scale = this._getScale();
    this.setZoomAuto(scale - 0.08);
  }

  // 1:1 放大
  one() {
    this.setZoomAuto(0.8 - 0.08);
    this.canvas.requestRenderAll();
  }

  _bindWheel() {
    this.canvas.on('mouse:wheel', function (this: fabric.Canvas, opt) {
      const delta = opt.e.deltaY;
      let zoom = this.getZoom();
      zoom *= 0.999 ** delta;
      if (zoom > 20) zoom = 20;
      if (zoom < 0.01) zoom = 0.01;
      const center = this.getCenter();
      this.zoomToPoint(new fabric.Point(center.left, center.top), zoom);
      opt.e.preventDefault();
      opt.e.stopPropagation();
    });
  }

  destroy() {
    console.log('pluginDestroy');
  }
}

export default WorkspacePlugin;
