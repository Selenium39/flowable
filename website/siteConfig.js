/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// See https://docusaurus.io/docs/site-config for all the possible
// site configuration options.

// List of projects/orgs using your project for the users page.
const users = [];

const siteConfig = {
  title: 'Flowable 中文文档', // Title for your website.
  tagline: '参考文档和用户指南',
  url: 'https://flowable.me', // Your website URL
  baseUrl: '/', // Base URL for your project */
  // For github.io type URLs, you would set the url and baseUrl like:
  //   url: 'https://facebook.github.io',
  //   baseUrl: '/test-site/',

  // Used for publishing and more
  projectName: 'flowable-userguide',
  organizationName: 'flowable',
  // For top-level user or org sites, the organization is still the same.
  // e.g., for the https://JoelMarcey.github.io site, it would be set like...
  //   organizationName: 'JoelMarcey'

  // For no header links in the top nav bar -> headerLinks: [],
  headerLinks: [
    {doc: 'oss-introduction', label: '指南'},
    {page: 'all-javadocs', label: 'Java文档'},
    {blog: true, label: '博客'},
    {href: 'https://ui.flowable.me/flowable-ui', label: 'Flowable UI', external: true},
    {href: 'https://mp.weixin.qq.com/s/AWbYObiXzJXveLbZl0AofA', label: '加入交流群', external: true},
    {href: 'https://ai.youdao.com/saas/qanything/#/bots/D4AAE344966648BE/share', label: '小流码', external: true},
    {href: 'https://www.flowable.com/open-source/docs/', label: '英文文档', external: true},
    { search: false },
  ],

  // If you have users set above, you add it here:
  users,

  /* path to images for header/footer */
  headerIcon: 'img/flowable-oss-icon@2.png',
  footerIcon: 'img/flowable-oss-icon@2.png',
  favicon: 'img/favicon.png',

  gaTrackingId: 'G-KLHZSMZ1LZ',
  gaGtag:true,

  /* Colors for website */
  colors: {
    primaryColor: '#1f3245',
    secondaryColor: '#a0cc47',
  },
  // algolia: {
  //   appId: '9W1V2HZH22',
  //   apiKey: '36c4f64227a4c3f0b08decf504b23906',
  //   indexName: 'flowable_chinese',
  //   algoliaOptions: {}, // Optional, if provided by Algolia
  //   placeholder: '搜索'
  // },

  /* Custom fonts for website */
  /*
  fonts: {
    myFont: [
      "Times New Roman",
      "Serif"
    ],
    myOtherFont: [
      "-apple-system",
      "system-ui"
    ]
  },
  */

  // This copyright info is used in /core/Footer.js and blog RSS/Atom feeds.
  copyright: `版权 © ${new Date().getFullYear()} Flowable AG. 中文文档基于 Apache License 2.0 协议翻译`,

  highlight: {
    // Highlight.js theme to use for syntax highlighting in code blocks.
    theme: 'default',
  },

  // Add custom scripts here that would be placed in <script> tags.
  scripts: [
  'https://buttons.github.io/buttons.js',
  {
    src: 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3914969090265698',
    async: true,
    crossOrigin: 'anonymous',
  },
  {
    src: "https://ai.youdao.com/saas/qanything/js/agent-iframe-min.js",
    id: "qanything-iframe",
    defer: true,
    "data-agent-src": "https://ai.youdao.com/saas/qanything/#/bots/D4AAE344966648BE/share",
    "data-default-open": "false",
    "data-drag": "true",
    "data-open-icon": "https://download.ydstatic.com/ead/icon-qanything-iframe-btn.png",
    "data-close-icon": "https://download.ydstatic.com/ead/icon-qanything-iframe-btn.png"
  },
  {
    src: 'https://umami.selenium39.me/script.js',
    defer: true,
    'data-website-id': '7c3629e9-657a-4b79-bdad-edb995325ad3'
  }
],

  // On page navigation for the current documentation page.
  onPageNav: 'separate',
  // No .html extensions for paths.
  cleanUrl: true,
  docsUrl: '',
  scrollToTop: true,

  // Open Graph and Twitter card images.
  ogImage: 'img/undraw_online.svg',
  twitterImage: 'img/undraw_tweetstorm.svg',

  // For sites with a sizable amount of content, set collapsible to true.
  // Expand/collapse the links and subcategories under categories.
  docsSideNavCollapsible: true,

  // Show documentation's last contributor's name.
  // enableUpdateBy: true,

  // Show documentation's last update time.
  // enableUpdateTime: true,

  // You may provide arbitrary config keys to be used as needed by your
  // template. For example, if you need your repo's URL...
  repoUrl: 'https://github.com/Selenium39/flowable-docs',

  i18n: {
    defaultLocale: 'zh-CN',
    locales: ['zh-CN'],
    localeConfigs: {
      'zh-CN': {
        label: '简体中文',
        direction: 'ltr',
      },
    },
  },

  // 博客相关翻译
  blogSidebarTitle: {
    default: '最新文章',
    all: '所有文章',
  },

  // 博客配置
  blogSidebarCount: 'ALL',
};

module.exports = siteConfig;
