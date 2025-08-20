/**
* Copyright (c) 2017-present, Facebook, Inc.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/
const React = require("react");

class Footer extends React.Component {
  docUrl(doc, language) {
    const baseUrl = this.props.config.baseUrl;
    const docsUrl = this.props.config.docsUrl;
    const docsPart = `${docsUrl ? `${docsUrl}/` : ""}`;
    const langPart = "";
    return `${baseUrl}${docsPart}${langPart}${doc}`;
  }

  pageUrl(doc, language) {
    const baseUrl = this.props.config.baseUrl;
    return baseUrl + doc;
  }

  render() {
    return (
      <footer className="nav-footer" id="footer">
        <section className="sitemap">
          <a href={this.props.config.baseUrl} className="nav-home">
            {this.props.config.footerIcon && (
              <img
                src={this.props.config.baseUrl + this.props.config.footerIcon}
                alt={this.props.config.title}
              />
            )}
          </a>
          <div>
            <h5>文档</h5>
            <a href={this.docUrl("oss-introduction", this.props.language)}>
              指南
            </a>
            <a href={this.docUrl("javadocs/index.html", this.props.language)}>
              Java文档
            </a>
          </div>
          <div>
            <h5>法律</h5>
            <a href={this.docUrl("disclaimer", this.props.language)}>
              免责声明
            </a>
            <a href="https://flowable.com/disclaimer/">政策</a>
            <a href="https://raw.githubusercontent.com/flowable/flowable-engine/refs/heads/main/LICENSE">
              开源协议
            </a>
          </div>
          <div>
            <h5>联系方式</h5>
            <a href="mailto:selenium39@qq.com">
              邮箱: selenium39@qq.com
            </a>
          </div>
          <div>
            <h5>友情链接</h5>
            <a href="https://chat-tempmail.com" target="_blank">
              ChatTempMail
            </a>
            <a href="https://fwfw.app" target="_blank">
              FWFW
            </a>
            <a href="https://llmocr.com" target="_blank">
              LLMOCR
            </a>
            <a href="https://mihoyonb.com" target="_blank">
              原牛
            </a>
          </div>
        </section>
        <section className="copyright">{this.props.config.copyright}</section>
      </footer>
    );
  }
}

module.exports = Footer;