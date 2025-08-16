/**
* Copyright (c) 2017-present, Facebook, Inc.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/
const React = require('react');
const CompLibrary = require('../../core/CompLibrary.js');
const MarkdownBlock = CompLibrary.MarkdownBlock; /* 用于读取markdown */
const Container = CompLibrary.Container;
const GridBlock = CompLibrary.GridBlock;

class Index extends React.Component {
 render() {
   const {config: siteConfig, language = ''} = this.props;
   const {baseUrl, docsUrl} = siteConfig;
   const docsPart = `${docsUrl ? `${docsUrl}/` : ''}`;
   const langPart = `${language ? `${language}/` : ''}`;
   const docUrl = doc => `${baseUrl}${docsPart}${langPart}${doc}`;

   const Block = props => (
     <Container
       padding={['bottom', 'top']}
       id={props.id}
       background={props.background}>
       <GridBlock
         align="left"
         contents={props.children}
         layout={props.layout}
       />
     </Container>
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

   const Talks = () => (
     <Container
       padding={['bottom', 'top']}
       background="light"
       className="productShowcaseSection">
       <h2>演讲和教程</h2>
       <div className="productShowcaseSection">
         <p>如果你只是想下载Flowable并快速体验一下,这篇文章非常适合你:</p>
         <a className="normal-link" href="https://blog.flowable.org/2020/10/07/flowable-6-instant-gratification/">Flowable 6即时体验</a>
         <h3>这里是我们的一些演讲:</h3>
         <a className="normal-link" href="https://www.youtube.com/watch?v=uSQVtm8O7SA">bpmNEXT 2019: 有意图的流程案例</a><br/>
         <a className="normal-link" href="https://www.youtube.com/watch?v=nX0dRiPqOmk">Devoxx 2019: 基于Kafka事件的Flowable业务处理</a><br/>
         <a className="normal-link" href="https://www.youtube.com/watch?v=fyxRHZaCSSA">bpmNEXT 2018: 使流程个性化</a><br/>
         <a className="normal-link" href="https://www.youtube.com/watch?v=vzgU1lZ1h3U">Jax London 2018: 在NoSQL上使用事务性BPM进行服务编排</a><br/>
         <a className="normal-link" href="https://www.youtube.com/watch?v=i8dYR0LdpHg">Devoxx 2017: 将AI引入Flowable流程引擎</a><br/>
         <a className="normal-link" href="https://www.youtube.com/watch?v=5qIw3JTw-mI">bpmNEXT 2017: 让业务流程符合用户习惯</a><br/>
         <a className="normal-link" href="https://www.youtube.com/watch?v=HaZQTrfNAgo">Codemotion 2017: 将AI引入Flowable流程引擎</a><br/>
         <h3>FlowFest社区活动演讲:</h3>
         <a className="normal-link" href="https://flowable.com/flowfest2018">FlowFest 2018: 所有演讲</a><br/>
         <a className="normal-link" href="https://flowable.com/flowfest2019">FlowFest 2019: 所有演讲</a>
         <h3>以及其他一些链接:</h3>
         <a className="normal-link" href="https://www.youtube.com/watch?v=43_OLrxU3so">Josh Long: Spring技巧: 使用Flowable进行业务流程管理</a>
       </div>
     </Container>
   );

   const Started = () => (
     <Container
       padding={['bottom', 'top']}
       className="productShowcaseSection">
       <h2>入门指南</h2>
       <MarkdownBlock>如果你是Flowable新手,这里是最好的起点。它会向你展示如何在几分钟内开始使用,无论是使用UI应用还是介绍引擎API的基础知识。</MarkdownBlock>
       <PromoSection>
         <Button href={docUrl('bpmn/ch14-Applications')}>应用入门</Button>
         <Button href={docUrl('bpmn/ch02-GettingStarted')}>代码入门</Button>
       </PromoSection>
     </Container>
   );

   const Guides = () => (
     <Container
       padding={['bottom', 'top']}
       background="light"
       className="productShowcaseSection">
       <h2>指南</h2>
       <MarkdownBlock>用户指南包含了不同Flowable引擎功能的详细说明。BPMN用于流程管理,CMMN用于案例管理,DMN用于决策规则。</MarkdownBlock>
       <PromoSection>
         <Button href={docUrl('bpmn/ch02-GettingStarted')}>BPMN</Button>
         <Button href={docUrl('cmmn/ch02-Configuration')}>CMMN</Button>
         <Button href={docUrl('eventregistry/ch02-Configuration')}>事件注册</Button>
         <Button href={docUrl('dmn/ch02-Configuration')}>DMN</Button>
         <Button href={docUrl('form/ch02-Configuration')}>表单</Button>
       </PromoSection>
     </Container>
   );

   const REST = () => (
     <Container
       padding={['bottom', 'top']}
       className="productShowcaseSection">
       <h2>REST APIs</h2>
       <MarkdownBlock>Flowable提供了丰富的REST API,几乎完全覆盖了Flowable Java API的功能。这些是最简单和最灵活的API。此外,我们在Flowable v6中添加了Swagger支持。启动Flowable REST应用后访问http://localhost:8080/flowable-rest/docs即可试用</MarkdownBlock>
       <PromoSection>
         <Button href={docUrl('bpmn/ch15-REST')}>BPMN</Button>
         <Button href={docUrl('cmmn/ch08-REST')}>CMMN</Button>
         <Button href={docUrl('dmn/ch07-REST')}>DMN</Button>
         <Button href={docUrl('eventregistry/ch07-REST')}>事件注册</Button>
         <Button href={docUrl('form/ch07-REST')}>表单</Button>
       </PromoSection>
     </Container>
   );

   const Head = () => (
     <Container
       padding={['bottom', 'top']}>
       <GridBlock
         align="left"
         contents={[
           {
             title: 'Flowable中文文档',
             content: '欢迎访问Flowable中文文档。在这里你可以找到帮助你开发使用Flowable BPM的应用和服务的指南和参考文档。本文档持续更新中,请经常访问查看最新内容\n\n本中文文档是基于 Flowable 官方文档翻译而来，遵循 Apache License 2.0 协议。原文档版权归 Flowable 所有。',
             image: `${baseUrl}img/flowable-boffin.png`,
           },
         ]}
       />
     </Container>
   );

   const Flowable5 = () => (
     <Block background="light">
       {[
         {
           content:
             '迁移指南提供了如何将Flowable或Activiti v5升级到Flowable v6的信息。无需进行数据库更改,对大多数人来说只需要重命名包和类。<br/><br/>[查看迁移指南](migration)',
           image: `${baseUrl}img/flowable-beta.png`,
           imageAlign: 'left',
           title: 'Flowable 5迁移',
         },
       ]}
     </Block>
   );

   const Olddocs = () => (
     <Container
       padding={['bottom', 'top']}
       className="productShowcaseSection">
       <h2>Flowable 5文档</h2>
       <MarkdownBlock>上述文档的Flowable 5版本可以在这些页面找到。</MarkdownBlock>
       <PromoSection>
         <Button href="https://flowable.com/open-source/docs/userguide-5/index.html#_getting_started">V5入门指南</Button>
         <Button href="https://flowable.com/open-source/docs/userguide-5/index.html">V5用户指南</Button>
         <Button href="https://flowable.com/open-source/docs/userguide-5/index.html#restApiChapter">V5 REST API</Button>
         <Button href="https://flowable.com/open-source/docs/javadocs-5/index.html">V5 Java文档</Button>
       </PromoSection>
     </Container>
   );

   return (
     <div>
       <Head />
       <div className="mainContainer">
         <Talks />
         <Started />
         <Guides />
         <REST />
         <Flowable5 />
         <Olddocs />
       </div>
     </div>
   );
 }
}

module.exports = Index;