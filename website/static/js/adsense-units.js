/**
 * 手动 AdSense 广告位注入（替代自动广告）。
 *
 * 广告位（需与 AdSense 后台的广告单元一一对应）：
 *  - 文档/博客正文末尾：flowable-doc-footer        slot 3643944453
 *  - 右侧 TOC 栏底部：  flowable-doc-sidebar-bottom slot 1418815370
 *
 * 仅在存在对应容器的页面注入：正文广告要求 .post（文档页/博客文章页），
 * 侧栏广告要求 nav.onPageNav（开侧栏 TOC 的内页）。首页两者皆无，不会注入。
 */
(function () {
  'use strict';

  var AD_CLIENT = 'ca-pub-3914969090265698';
  var UNITS = {
    docFooter: '3643944453',
    sidebarBottom: '1418815370',
  };

  if (document.getElementById('adsense-units-style')) return;

  var style = document.createElement('style');
  style.id = 'adsense-units-style';
  style.textContent = [
    '.adsense-unit { margin: 32px 0; text-align: center; }',
    '.adsense-unit ins.adsbygoogle { display: block; }',
    // 右侧 TOC 栏宽度固定 240px，广告跟随栏宽；TOC 下方留出间距
    '.adsense-unit--sidebar { margin: 16px 0 40px; }',
    // 侧栏广告仅桌面端显示；onPageNav 在移动端会被复用为全屏目录抽屉
    '@media only screen and (max-width: 1023px) {',
    '  .adsense-unit--sidebar { display: none; }',
    '}',
  ].join('\n');
  document.head.appendChild(style);

  function mountAd(slot, className, container, append) {
    if (!container) return;
    var unit = document.createElement('div');
    unit.className = 'adsense-unit ' + className;
    unit.setAttribute('data-adsense-slot', slot);

    var ins = document.createElement('ins');
    ins.className = 'adsbygoogle';
    ins.style.display = 'block';
    ins.setAttribute('data-ad-client', AD_CLIENT);
    ins.setAttribute('data-ad-slot', slot);
    ins.setAttribute('data-ad-format', 'auto');
    ins.setAttribute('data-full-width-responsive', 'true');
    unit.appendChild(ins);

    if (append) {
      container.appendChild(unit);
    } else {
      container.parentNode.insertBefore(unit, container.nextSibling);
    }
    (window.adsbygoogle = window.adsbygoogle || []).push({});
  }

  function onReady() {
    // 正文末尾：插在 .post（含 article）之后、mainContainer 内，全宽自适应
    var post = document.querySelector('.post');
    if (post) {
      mountAd(UNITS.docFooter, 'adsense-unit--doc-footer', post, false);
    }
    // 右侧 TOC 栏底部：nav.onPageNav 是 sticky 容器，广告跟在目录列表后
    var toc = document.querySelector('nav.onPageNav');
    if (toc) {
      mountAd(UNITS.sidebarBottom, 'adsense-unit--sidebar', toc, true);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', onReady);
  } else {
    onReady();
  }
})();
