/**
 * 腾讯云 CPS 推广位注入（轻量文字条，成交返佣）。
 *
 * 推广产品：推广大使特惠产品合集页（云服务器、云数据库、COS、CDN、短信等）。
 * 链接与文案取自腾讯云控制台「推广素材」页，cps_key 为账号专属返佣参数；
 * 更换推广产品时只需更新 PROMO。推广效果见控制台「推广效果」页。
 *
 * 展示位置：文档/博客正文末尾，要求页面存在 .post，与 adsense-units.js 的
 * 正文广告位同区域；脚本在其后注册，若广告位已挂载则插在广告位之后。
 * 首页无 .post，不注入。链接带 rel="nofollow sponsored"，符合搜索引擎规范。
 */
(function () {
  'use strict';

  var PROMO = {
    text: '腾讯云特惠热卖中：云服务器、云数据库、COS、CDN、短信等云产品 →',
    href:
      'https://cloud.tencent.com/act/cps/redirect?redirect=2446' +
      '&cps_key=638bb157d3459281b3b3ff43488dd453&from=console',
  };

  if (document.getElementById('cps-units-style')) return;

  var style = document.createElement('style');
  style.id = 'cps-units-style';
  style.textContent = [
    '.cps-unit { margin: 24px 0; padding: 12px 16px; font-size: 14px;',
    '  border: 1px solid #e8e8e8; border-radius: 4px; background: #fafafa;',
    '  display: flex; align-items: center; flex-wrap: wrap; gap: 10px; }',
    '.cps-unit__tag { flex: none; font-size: 12px; line-height: 1; padding: 3px 6px;',
    '  border: 1px solid #d0d0d0; border-radius: 3px; color: #999; }',
    '.cps-unit__link { color: #1f3245; }',
    '.cps-unit__link:hover { text-decoration: underline; }',
  ].join('\n');
  document.head.appendChild(style);

  function onReady() {
    var post = document.querySelector('.post');
    if (!post) return;
    // 已有 AdSense 正文广告位时插在其后，否则直接插在正文之后
    var anchor = document.querySelector('.adsense-unit--doc-footer') || post;

    var bar = document.createElement('div');
    bar.className = 'cps-unit';

    var tag = document.createElement('span');
    tag.className = 'cps-unit__tag';
    tag.textContent = '推广';
    bar.appendChild(tag);

    var link = document.createElement('a');
    link.className = 'cps-unit__link';
    link.href = PROMO.href;
    link.target = '_blank';
    link.rel = 'nofollow sponsored noopener';
    link.textContent = PROMO.text;
    bar.appendChild(link);

    anchor.parentNode.insertBefore(bar, anchor.nextSibling);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', onReady);
  } else {
    onReady();
  }
})();
