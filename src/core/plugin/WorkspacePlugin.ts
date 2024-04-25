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
    const workspace = new fabric.Rect({
      fill: '#E0E3EC',
      width: width,
      height,
      id: 'workspace',
      stroke: '#E0E3EC',
      strokeWidth: 0,
      rx: 30,
      ry: 30,
    });
    workspace.set('selectable', false);
    workspace.set('hasControls', false);
    workspace.hoverCursor = 'default';
    this.canvas.add(workspace);

    // Add pages
    const pageMargin = 60; // Adjust this to change the size of the pages relative to the workspace
    const pageGap = 20; // Adjust this to change the gap between the pages
    const pageWidth = (width - 2 * pageMargin - pageGap) / 2;
    const pageHeight = height - 2 * pageMargin;
    const pageColor = 'white';
    const pageShadow = new fabric.Shadow({
      color: 'rgba(0,0,0,0.3)',
      blur: 15,
      offsetX: 0, // Set offsetX to 0
      offsetY: 0, // Set offsetY to 0
    });

    const page1 = new fabric.Rect({
      fill: pageColor,
      width: pageWidth,
      height: pageHeight,
      left: pageMargin,
      top: pageMargin,
      shadow: pageShadow,
    });
    page1.set('selectable', false);
    page1.set('hasControls', false);
    page1.hoverCursor = 'default';
    this.canvas.add(page1);

    const page2 = new fabric.Rect({
      fill: pageColor,
      width: pageWidth,
      height: pageHeight,
      left: pageWidth + pageMargin + pageGap, // Decrease the gap between the two pages
      top: pageMargin,
      shadow: pageShadow,
    });
    page2.set('selectable', false);
    page2.set('hasControls', false);
    page2.hoverCursor = 'default';
    this.canvas.add(page2);
    this.canvas.add(page2);
    // Add tabs
    const tabWidth = 60;
    const tabHeight = 200;
    const numberOfTabs = 11;
    for (let i = 0; i < numberOfTabs; i++) {
      const tab = new fabric.Rect({
        fill: 'green', // Make the color red
        width: tabWidth,
        height: tabHeight,
        left: workspace.width - tabWidth + 20, // Position the tab on the right side but inside the workspace
        top: i * (tabHeight + 10), // Position the tabs vertically with a 10px gap
        id: `tabsRect-${uuid()}`,
      });
      // Do not set 'selectable' and 'hasControls' to false
      this.canvas.add(tab);
    }

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
    // this.workspace.clone((cloned: fabric.Rect) => {
    //   this.canvas.clipPath = cloned;
    //   this.canvas.requestRenderAll();
    // });
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
