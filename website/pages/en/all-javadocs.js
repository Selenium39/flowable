/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');

const CompLibrary = require('../../core/CompLibrary.js');

const MarkdownBlock = CompLibrary.MarkdownBlock; /* Used to read markdown */
const Container = CompLibrary.Container;
const GridBlock = CompLibrary.GridBlock;

class HomeSplash extends React.Component {
  render() {
    const {siteConfig, language = ''} = this.props;
    const {baseUrl, docsUrl} = siteConfig;
    const docsPart = `${docsUrl ? `${docsUrl}/` : ''}`;
    const langPart = `${language ? `${language}/` : ''}`;
    const docUrl = doc => `${baseUrl}${docsPart}${langPart}${doc}`;

    const SplashContainer = props => (
      <div className="homeContainer">
        <div className="homeSplashFade">
          <div className="wrapper homeWrapper">{props.children}</div>
        </div>
      </div>
    );

    const Logo = props => (
      <div className="projectLogo">
        <img src={props.img_src} alt="Project Logo" />
      </div>
    );

    const ProjectTitle = () => (
      <h2 className="projectTitle">
        Flowable Java文档
        <small>Java开发者文档</small>
      </h2>
    );

    const PromoSection = props => (
      <div className="section promoSection">
        <div className="promoRow">
          <div className="pluginRowBlock">{props.children}</div>
        </div>
      </div>
    );

    const Button = props => (
      <div className="pluginWrapper buttonWrapper">
        <a className="button" href={props.href} target={props.target}>
          {props.children}
        </a>
      </div>
    );

    return (
      <SplashContainer>
        <div className="inner">
          <ProjectTitle />
          <p>要与您的应用程序实现最紧密的集成，您可以使用 Java API。从高层到最深层的定制，这是最权威的参考文档。</p>
          <PromoSection>
            <Button href={'https://flowable.com/open-source/docs/javadocs/index.html'} target="_blank">业务流程管理</Button>
            <Button href={'https://flowable.com/open-source/docs/cmmn-javadocs/index.html'} target="_blank">案例管理</Button>
            <Button href={'https://flowable.com/open-source/docs/task-javadocs/index.html'} target="_blank">任务</Button>
          </PromoSection>
          <PromoSection>
            <Button href={'https://flowable.com/open-source/docs/variable-javadocs/index.html'} target="_blank">变量</Button>
            <Button href={'https://flowable.com/open-source/docs/job-javadocs/index.html'} target="_blank">作业</Button>
            <Button href={'https://flowable.com/open-source/docs/batch-javadocs/index.html'} target="_blank">批处理</Button>
            <Button href={'https://flowable.com/open-source/docs/entitylink-javadocs/index.html'} target="_blank">实体链接</Button>
          </PromoSection>
          <PromoSection>
            <Button href={'https://flowable.com/open-source/docs/eventregistry-javadocs/index.html'} target="_blank">事件注册表</Button>
            <Button href={'https://flowable.com/open-source/docs/eventsubscription-javadocs/index.html'} target="_blank">事件订阅</Button>
          </PromoSection>
        </div>
      </SplashContainer>
    );
  }
}

class Javadocs extends React.Component {
  render() {
    const {config: siteConfig, language = ''} = this.props;
    const {baseUrl} = siteConfig;

    const Block = props => (
      <Container
        padding={['bottom', 'top']}
        id={props.id}
        background={props.background}>
        <GridBlock
          align="center"
          contents={props.children}
          layout={props.layout}
        />
      </Container>
    );

    return (
      <div>
        <HomeSplash siteConfig={siteConfig} language={language} />
      </div>
    );
  }
}

module.exports = Javadocs;
