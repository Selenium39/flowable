---
id: ch05a-Spring-Boot
title: Spring Boot
description: 本文档详细介绍如何将Flowable BPMN引擎与Spring Boot集成，提供快速启动指南和依赖配置示例，帮助开发者实现零配置创建生产级Spring应用。
keywords: Flowable,Spring Boot,BPMN,工作流引擎,Spring集成,自动化配置,快速启动,Maven依赖
---

Spring Boot 是一个应用框架,根据[其官网](http://projects.spring.io/spring-boot/)所述,*它让创建独立的、生产级别的基于 Spring 的应用变得简单,你可以"直接运行"。它对 Spring 平台和第三方库采用了固定的视图,这样你就可以以最小的配置开始使用。大多数 Spring Boot 应用只需要很少的 Spring 配置*。

更多关于 Spring Boot 的信息,请参见 [<http://projects.spring.io/spring-boot/>](http://projects.spring.io/spring-boot/)

Spring Boot - Flowable 的集成是与 Spring 提交者一起开发的。

## 兼容性

Flowable 支持 Spring Boot 3.x。

## 入门

Spring Boot 的理念是约定优于配置。
要开始使用,你需要创建一个 Spring Boot 项目。
最简单的方法是通过 [start.spring.io](https://start.spring.io/) 创建项目。
例如创建一个包含 web 和 h2 依赖的项目。
然后在创建的项目中简单添加 *flowable-spring-boot-starter* 或 *flowable-spring-boot-starter-rest* 依赖。
如果你不需要所有引擎,请参见其他 [Flowable starters](bpmn/ch05a-Spring-Boot.md#flowable-starters)。
以下是 Maven 示例:

    <dependency>
        <groupId>org.flowable</groupId>
        <artifactId>flowable-spring-boot-starter</artifactId>
        <version>${flowable.version}</version>
    </dependency>

这就是所需要的全部内容。这个依赖会自动添加正确的 Flowable 依赖到类路径中。
现在你可以运行你的 Spring Boot 应用了:

    import org.springframework.boot.SpringApplication;
    import org.springframework.boot.autoconfigure.SpringBootApplication;

    @SpringBootApplication(proxyBeanMethods = false)
    public class MyApplication {

        public static void main(String[] args) {
            SpringApplication.run(MyApplication.class, args);
        }

    }

你将看到如下输出:

  .   ____          _            __ _ _
 /\\ / ___'_ __ _ _(_)_ __  __ _ \ \ \ \
( ( )\___ | '_ | '_| | '_ \/ _` | \ \ \ \
 \\/  ___)| |_)| | | | | || (_| |  ) ) ) )
  '  |____| .__|_| |_|_| |_\__, | / / / /
 =========|_|==============|___/=/_/_/_/
 :: Spring Boot ::                (v3.1.3)

2023-09-21T08:25:58.169+02:00  INFO 6126 --- [           main] org.flowable.example.MyApplication       : Starting MyApplication using Java 17.0.6 with PID 6126 (/Users/flowable/workspaces/flowable-engine-workspace/flowable-spring-boot-example/target/classes started by flowable in /Users/flowable/workspaces/flowable-engine-workspace/flowable-spring-boot-example)
2023-09-21T08:25:58.171+02:00  INFO 6126 --- [           main] org.flowable.example.MyApplication       : No active profile set, falling back to 1 default profile: "default"
2023-09-21T08:25:58.422+02:00  INFO 6126 --- [           main] o.f.s.b.app.AppEngineAutoConfiguration   : No deployment resources were found for autodeployment
2023-09-21T08:25:58.454+02:00  INFO 6126 --- [           main] o.f.s.b.ProcessEngineAutoConfiguration   : No deployment resources were found for autodeployment
2023-09-21T08:25:58.517+02:00  INFO 6126 --- [           main] o.f.s.b.c.CmmnEngineAutoConfiguration    : No deployment resources were found for autodeployment
2023-09-21T08:25:58.546+02:00  INFO 6126 --- [           main] o.f.s.b.dmn.DmnEngineAutoConfiguration   : No deployment resources were found for autodeployment
2023-09-21T08:25:58.615+02:00  INFO 6126 --- [           main] o.f.s.b.e.EventRegistryAutoConfiguration : No deployment resources were found for autodeployment
2023-09-21T08:25:58.624+02:00  INFO 6126 --- [           main] o.f.a.s.SpringAppEngineConfiguration     : Found 5 Engine Configurators in total:
2023-09-21T08:25:58.624+02:00  INFO 6126 --- [           main] o.f.a.s.SpringAppEngineConfiguration     : class org.flowable.engine.spring.configurator.SpringProcessEngineConfigurator (priority:50000)
2023-09-21T08:25:58.624+02:00  INFO 6126 --- [           main] o.f.a.s.SpringAppEngineConfiguration     : class org.flowable.eventregistry.spring.configurator.SpringEventRegistryConfigurator (priority:100000)
2023-09-21T08:25:58.624+02:00  INFO 6126 --- [           main] o.f.a.s.SpringAppEngineConfiguration     : class org.flowable.idm.spring.configurator.SpringIdmEngineConfigurator (priority:150000)
2023-09-21T08:25:58.624+02:00  INFO 6126 --- [           main] o.f.a.s.SpringAppEngineConfiguration     : class org.flowable.dmn.spring.configurator.SpringDmnEngineConfigurator (priority:200000)
2023-09-21T08:25:58.624+02:00  INFO 6126 --- [           main] o.f.a.s.SpringAppEngineConfiguration     : class org.flowable.cmmn.spring.configurator.SpringCmmnEngineConfigurator (priority:500000)
2023-09-21T08:25:58.624+02:00  INFO 6126 --- [           main] o.f.a.s.SpringAppEngineConfiguration     : Executing beforeInit() of class org.flowable.engine.spring.configurator.SpringProcessEngineConfigurator (priority:50000)
2023-09-21T08:25:58.635+02:00  INFO 6126 --- [           main] o.f.a.s.SpringAppEngineConfiguration     : Executing beforeInit() of class org.flowable.eventregistry.spring.configurator.SpringEventRegistryConfigurator (priority:100000)
2023-09-21T08:25:58.636+02:00  INFO 6126 --- [           main] o.f.a.s.SpringAppEngineConfiguration     : Executing beforeInit() of class org.flowable.idm.spring.configurator.SpringIdmEngineConfigurator (priority:150000)
2023-09-21T08:25:58.638+02:00  INFO 6126 --- [           main] o.f.a.s.SpringAppEngineConfiguration     : Executing beforeInit() of class org.flowable.dmn.spring.configurator.SpringDmnEngineConfigurator (priority:200000)
2023-09-21T08:25:58.639+02:00  INFO 6126 --- [           main] o.f.a.s.SpringAppEngineConfiguration     : Executing beforeInit() of class org.flowable.cmmn.spring.configurator.SpringCmmnEngineConfigurator (priority:500000)
2023-09-21T08:25:58.649+02:00  INFO 6126 --- [           main] com.zaxxer.hikari.HikariDataSource       : HikariPool-1 - Starting...
2023-09-21T08:25:58.715+02:00  INFO 6126 --- [           main] com.zaxxer.hikari.pool.HikariPool        : HikariPool-1 - Added connection conn0: url=jdbc:h2:mem:bbfb33f7-7e39-43be-a042-1a767c16ed70 user=SA
2023-09-21T08:25:58.715+02:00  INFO 6126 --- [           main] com.zaxxer.hikari.HikariDataSource       : HikariPool-1 - Start completed.

因此,仅通过添加依赖到类路径并使用 *@SpringBootApplication* 注解,在后台就发生了很多事情:

- 自动创建了一个内存数据源(因为 H2 驱动在类路径中)并传递给了 Flowable 流程引擎配置

- 创建并暴露了 Flowable ProcessEngine、CmmnEngine、DmnEngine 和 IdmEngine beans

- 所有 Flowable 服务都作为 Spring beans 暴露出来

- 创建了 Spring Job Executor

同时:

- *processes* 文件夹中的任何 BPMN 2.0 流程定义都会被自动部署。创建一个 *processes* 文件夹并添加一个示例流程定义(命名为 *one-task-process.bpmn20.xml*)到这个文件夹。该文件的内容如下所示。

- *cases* 文件夹中的任何 CMMN 1.1 案例定义都会被自动部署。

- *dmn* 文件夹中的任何 DMN 1.1 决策定义都会被自动部署。

流程定义的 XML 内容如下所示。注意,目前我们在用户任务中硬编码了一个名为"kermit"的受理人。我们稍后会回来修改这个。

    <?xml version="1.0" encoding="UTF-8"?>
    <definitions
            xmlns="http://www.omg.org/spec/BPMN/20100524/MODEL"
            xmlns:flowable="http://flowable.org/bpmn"
            targetNamespace="Examples">

        <process id="oneTaskProcess" name="The One Task Process">
            <startEvent id="theStart" />
            <sequenceFlow id="flow1" sourceRef="theStart" targetRef="theTask" />
            <userTask id="theTask" name="my task" flowable:assignee="kermit" />
            <sequenceFlow id="flow2" sourceRef="theTask" targetRef="theEnd" />
            <endEvent id="theEnd" />
        </process>

    </definitions>

另外,添加以下代码行来测试部署是否真的生效。*CommandLineRunner* 是一个特殊的 Spring bean,它会在应用启动时执行:

    @SpringBootApplication(proxyBeanMethods = false)
    public class MyApplication {

        public static void main(String[] args) {
            SpringApplication.run(MyApplication.class, args);
        }

        @Bean
        public CommandLineRunner init(final RepositoryService repositoryService,
                                      final RuntimeService runtimeService,
                                      final TaskService taskService) {

            return new CommandLineRunner() {
                @Override
                public void run(String... strings) throws Exception {
                    System.out.println("Number of process definitions : "
                        + repositoryService.createProcessDefinitionQuery().count());
                    System.out.println("Number of tasks : " + taskService.createTaskQuery().count());
                    runtimeService.startProcessInstanceByKey("oneTaskProcess");
                    System.out.println("Number of tasks after process start: "
                        + taskService.createTaskQuery().count());
                }
            };
        }
    }

预期的输出将是:

    Number of process definitions : 1
    Number of tasks : 0
    Number of tasks after process start : 1

## 更改数据库和连接池

如上所述,Spring Boot 的理念是约定优于配置。默认情况下,由于类路径中只有 H2,它创建了一个内存数据源并将其传递给了 Flowable 流程引擎配置。

要更改数据源,只需添加数据库驱动依赖并提供数据库的 URL。
例如,要切换到 MySQL 数据库:

    spring.datasource.url=jdbc:mysql://127.0.0.1:3306/flowable-spring-boot?characterEncoding=UTF-8
    spring.datasource.username=flowable
    spring.datasource.password=flowable

从 Maven 依赖中移除 H2 并将 MySQL 驱动添加到类路径:

    <dependency>
        <groupId>mysql</groupId>
        <artifactId>mysql-connector-java</artifactId>
        <version>5.1.45</version>
    </dependency>

当应用现在启动时,你会看到它使用 MySQL 作为数据库(以及 HikariCP 连接池框架):

    org.flowable.engine.impl.db.DbSqlSession   : performing create on engine with resource org/flowable/db/create/flowable.mysql.create.engine.sql
    org.flowable.engine.impl.db.DbSqlSession   : performing create on history with resource org/flowable/db/create/flowable.mysql.create.history.sql
    org.flowable.engine.impl.db.DbSqlSession   : performing create on identity with resource org/flowable/db/create/flowable.mysql.create.identity.sql

当你多次重启应用时,你会看到任务数量会增加(H2 内存数据库在关闭时不会保留数据,而 MySQL 会)。

关于如何配置数据源的更多信息,请参阅 Spring Boot 参考指南中的 [配置数据源](https://docs.spring.io/spring-boot/docs/current/reference/html/boot-features-sql.html#boot-features-configure-datasource)。

## REST 支持

通常,REST API 用于嵌入式 Flowable 引擎之上(与公司中的不同服务交互)。Spring Boot 使这变得非常简单。将以下依赖添加到类路径:

    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
        <version>${spring.boot.version}</version>
    </dependency>

创建一个新类,一个 Spring 服务并创建两个方法:一个用于启动我们的流程,另一个用于获取给定受理人的任务列表。这里我们只是简单包装了 Flowable 调用,但在实际场景中这会更复杂。

    @Service
    public class MyService {

        @Autowired
        private RuntimeService runtimeService;

        @Autowired
        private TaskService taskService;

        @Transactional
        public void startProcess() {
            runtimeService.startProcessInstanceByKey("oneTaskProcess");
        }

        @Transactional
        public List<Task> getTasks(String assignee) {
            return taskService.createTaskQuery().taskAssignee(assignee).list();
        }

    }

现在我们可以通过使用 *@RestController* 注解来创建一个 REST 端点。这里,我们只是简单地委托给上面定义的服务。

        @RestController
    public class MyRestController {

        @Autowired
        private MyService myService;

        @PostMapping(value="/process")
        public void startProcessInstance() {
            myService.startProcess();
        }

        @RequestMapping(value="/tasks", method= RequestMethod.GET, produces=MediaType.APPLICATION_JSON_VALUE)
        public List<TaskRepresentation> getTasks(@RequestParam String assignee) {
            List<Task> tasks = myService.getTasks(assignee);
            List<TaskRepresentation> dtos = new ArrayList<TaskRepresentation>();
            for (Task task : tasks) {
                dtos.add(new TaskRepresentation(task.getId(), task.getName()));
            }
            return dtos;
        }

        static class TaskRepresentation {

            private String id;
            private String name;

            public TaskRepresentation(String id, String name) {
                this.id = id;
                this.name = name;
            }

            public String getId() {
                return id;
            }
            public void setId(String id) {
                this.id = id;
            }
            public String getName() {
                return name;
            }
            public void setName(String name) {
                this.name = name;
            }

        }

    }

*@Service* 和 *@RestController* 都会被 Spring Boot 应用的自动组件扫描发现。
再次运行应用类。现在我们可以通过 REST API 进行交互,例如,使用 cURL:

    curl http://localhost:8080/tasks?assignee=kermit
    []

    curl -X POST  http://localhost:8080/process
    curl http://localhost:8080/tasks?assignee=kermit
    [{"id":"10004","name":"my task"}]

如你所见,我们引用了受理人"kermit",它之前被硬编码在流程定义 XML 中。我们稍后会修改这个,允许在工作流实例启动时设置受理人。

## JPA 支持

要在 Spring Boot 中为 Flowable 添加 JPA 支持,添加以下依赖:

    <dependency>
        <groupId>org.flowable</groupId>
        <artifactId>flowable-spring-boot-starter</artifactId>
        <version>${flowable.version}</version>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-jpa</artifactId>
        <version>${spring-boot.version</version>
    </dependency>

这将添加用于使用 JPA 的 Spring 配置和 beans。默认情况下,JPA 提供者将是 Hibernate。

让我们创建一个简单的实体类:

    @Entity
    class Person {

        @Id
        @GeneratedValue
        private Long id;

        private String username;

        private String firstName;

        private String lastName;

        private Date birthDate;

        public Person() {
        }

        public Person(String username, String firstName, String lastName, Date birthDate) {
            this.username = username;
            this.firstName = firstName;
            this.lastName = lastName;
            this.birthDate = birthDate;
        }

        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }

        public String getUsername() {
            return username;
        }

        public void setUsername(String username) {
            this.username = username;
        }

        public String getFirstName() {
            return firstName;
        }

        public void setFirstName(String firstName) {
            this.firstName = firstName;
        }

        public String getLastName() {
            return lastName;
        }

        public void setLastName(String lastName) {
            this.lastName = lastName;
        }

        public Date getBirthDate() {
            return birthDate;
        }

        public void setBirthDate(Date birthDate) {
            this.birthDate = birthDate;
        }
    }

默认情况下,当不使用内存数据库时,表不会自动创建。在类路径上创建一个 *application.properties* 文件并添加以下属性:

    spring.jpa.hibernate.ddl-auto=update

添加以下类:

    @Repository
    public interface PersonRepository extends JpaRepository<Person, Long> {

        Person findByUsername(String username);
    }

这是一个 Spring 仓库,它提供开箱即用的 CRUD 功能。我们添加了通过用户名查找 Person 的方法。Spring 将基于约定自动实现这个方法(通常是使用的属性名)。

现在我们进一步增强我们的服务:

- 通过给类添加 *@Transactional* 注解。注意,通过添加上面的 JPA 依赖,我们之前使用的 DataSourceTransactionManager 现在会自动被 JpaTransactionManager 替换。

- *startProcess* 现在接收一个受理人用户名作为参数,用于查找 Person,并将 Person JPA 对象作为流程变量放入流程实例中。

- 添加了一个创建示例用户的方法。这在 CommandLineRunner 中用于填充数据库。

<!-- -->

    @Service
    @Transactional
    public class MyService {

        @Autowired
        private RuntimeService runtimeService;

        @Autowired
        private TaskService taskService;

        @Autowired
        private PersonRepository personRepository;

        public void startProcess(String assignee) {

            Person person = personRepository.findByUsername(assignee);

            Map<String, Object> variables = new HashMap<String, Object>();
            variables.put("person", person);
            runtimeService.startProcessInstanceByKey("oneTaskProcess", variables);
        }

        public List<Task> getTasks(String assignee) {
            return taskService.createTaskQuery().taskAssignee(assignee).list();
        }

        public void createDemoUsers() {
            if (personRepository.findAll().size() == 0) {
                personRepository.save(new Person("jbarrez", "Joram", "Barrez", new Date()));
                personRepository.save(new Person("trademakers", "Tijs", "Rademakers", new Date()));
            }
        }

    }

现在 CommandLineRunner 看起来像这样:

    @Bean
    public CommandLineRunner init(final MyService myService) {

        return new CommandLineRunner() {
            public void run(String... strings) throws Exception {
                myService.createDemoUsers();
            }
        };
    }

RestController 也稍作修改以整合上述更改(仅显示新方法),并且 HTTP POST 现在有一个包含受理人用户名的请求体:

    @RestController
    public class MyRestController {

        @Autowired
        private MyService myService;

        @PostMapping(value="/process")
        public void startProcessInstance(@RequestBody StartProcessRepresentation startProcessRepresentation) {
            myService.startProcess(startProcessRepresentation.getAssignee());
        }

       ...

        static class StartProcessRepresentation {

            private String assignee;

            public String getAssignee() {
                return assignee;
            }

            public void setAssignee(String assignee) {
                this.assignee = assignee;
            }
        }

最后,为了测试 Spring-JPA-Flowable 集成,我们在流程定义中使用 Person JPA 对象的 ID 来分配任务:

    <userTask id="theTask" name="my task" flowable:assignee="${person.id}"/>

这替换了我们最初设置的硬编码接收者"kermit"。

现在我们可以启动一个新的流程实例,在 POST 请求体中提供用户名:

    curl -H "Content-Type: application/json" -d '{"assignee" : "jbarrez"}' http://localhost:8080/process

现在使用 person ID 来获取任务列表:

    curl http://localhost:8080/tasks?assignee=1

    [{"id":"12505","name":"my task"}]

## Flowable Actuator 端点

Flowable 提供了一个 Spring Boot Actuator 端点,用于暴露正在运行的流程信息。
默认情况下,`flowable` 端点映射到 `/actuator/flowable`。
Spring Boot 默认只向 web 暴露少量端点(例如:在 `spring-boot-starter-actuator:2.5.4` 中,Spring Boot 默认只向 web 暴露 `health` 端点。关于默认暴露到 web 的端点的更多信息,请参见 [https://docs.spring.io/spring-boot/docs/current/reference/html/actuator.html#actuator.endpoints.exposing](https://docs.spring.io/spring-boot/docs/current/reference/html/actuator.html#actuator.endpoints.exposing))。要通过 web 使用 `flowable` 端点,你需要在 `application.properties` 中添加 `management.endpoints.web.exposure.include=flowable` (注意:与 `HealthEndpointAutoConfiguration` 类不同,`org.flowable.spring.boot.EndpointAutoConfiguration` 类没有使用 `@ConditionalOnAvailableEndpoint` 注解来检查 `flowable` 端点是否同时启用和暴露。因此,要通过 web 使用 `flowable` 端点,你只需要在配置文件中添加 `management.endpoints.web.exposure.include=flowable` 或 `management.endpoints.web.exposure.include=*`)。

要启用 Actuator 端点,你需要添加 Actuator 依赖,例如使用 {sc-flowable-starter}/flowable-spring-boot-starter-actuator/pom.xml\[flowable-spring-boot-starter-actuator\]。

`curl http://localhost:8080/actuator/flowable`

    {
      "completedTaskCountToday": 0,
      "deployedProcessDefinitions": [
        "oneTaskProcess (v1)"
      ],
      "processDefinitionCount": 1,
      "cachedProcessDefinitionCount": 0,
      "runningProcessInstanceCount": {
        "oneTaskProcess (v1)": 0
      },
      "completedTaskCount": 2,
      "completedActivities": 3,
      "completedProcessInstanceCount": {
        "oneTaskProcess (v1)": 0
      },
      "openTaskCount": 0
    }

关于 Spring Boot Actuator 的更多信息,请参见 Spring Boot 参考文档中的 [生产就绪端点](https://docs.spring.io/spring-boot/docs/current/reference/html/production-ready-endpoints.html)。

## Flowable Info Contributor

Flowable 还提供了一个 Spring Boot `InfoContributor`,看起来像这样:

`curl http://localhost:8080/actuator/info`

    {
      "flowable": {
        "version": "6.6.0"
      }
    }

## Flowable 应用属性

Flowable 自动配置利用了 Spring Boot 的属性和配置机制。
参见 Spring Boot 参考指南中的 [属性和配置](https://docs.spring.io/spring-boot/docs/current/reference/html/howto-properties-and-configuration.html)。

以下是 Flowable Spring Boot 支持使用的配置属性列表。

    # ===================================================================
    # Flowable Spring Boot 通用属性
    #
    # 本示例文件仅作为指导。不要完整复制到你的应用中。 ^^^
    # ===================================================================

    # 核心(流程) https://github.com/flowable/flowable-engine/tree/main/modules/flowable-spring-boot/flowable-spring-boot-starters/flowable-spring-boot-autoconfigure/src/main/java/org/flowable/spring/boot/FlowableProperties.java
    flowable.check-process-definitions=true # 是否需要自动部署流程定义。
    flowable.custom-mybatis-mappers= # 需要添加到引擎的自定义 Mybatis 映射器的完全限定名。
    flowable.custom-mybatis-x-m-l-mappers= # 需要添加到引擎的自定义 Mybatis XML 映射器的位置。
    flowable.database-schema= # 在某些情况下,如果数据库元数据没有正确返回,你可能想要设置用于表检查/生成的 schema。
    flowable.database-schema-update=true # 应该使用的数据库 schema 策略。
    flowable.db-history-used=true # 是否应该使用数据库历史记录。
    flowable.deployment-name=SpringBootAutoDeployment # 自动部署的名称。
    flowable.history-level=audit # 需要使用的历史级别。
    flowable.process-definition-location-prefix=classpath*:/processes/ # 需要搜索自动部署流程的文件夹。
    flowable.process-definition-location-suffixes=**.bpmn20.xml,**.bpmn # 需要从'processDefinitionLocationPrefix'位置部署的文件的后缀(扩展名)。

    # 流程 https://github.com/flowable/flowable-engine/tree/main/modules/flowable-spring-boot/flowable-spring-boot-starters/flowable-spring-boot-autoconfigure/src/main/java/org/flowable/spring/boot/process/FlowableProcessProperties.java
    flowable.process.definition-cache-limit=-1 # 流程定义缓存中可用的最大流程定义数量。默认为 -1(所有流程定义)。
    flowable.process.enable-safe-xml=true # 启用对解析的 BPMN xml 的额外检查。不幸的是,此功能在某些平台上不可用,因此如果你的平台在 XML 解析期间不允许使用 StaxSource,则需要禁用它。
    flowable.process.servlet.load-on-startup=-1 # 流程调度 servlet 的启动加载。
    flowable.process.servlet.name=Flowable BPMN Rest API # 流程 servlet 的名称。
    flowable.process.servlet.path=/process-api # 流程 rest servlet 的上下文路径。

    # 流程异步执行器
    flowable.process.async-executor-activate=true # 是否应该激活异步执行器。
    flowable.process.async.executor.async-job-lock-time=PT5M # 异步作业被异步执行器获取时锁定的时间量。在此期间,其他异步执行器不会尝试获取和锁定此作业。
    flowable.process.async.executor.default-async-job-acquire-wait-time=PT10S # 当没有找到新的异步作业或获取的异步作业较少时,异步作业获取线程将等待执行下一个获取查询的时间。默认值 = 10 秒。
    flowable.process.async.executor.default-queue-size-full-wait-time=PT5S # 当队列已满时,异步作业(定时器和异步延续)获取线程将等待执行下一个查询的时间。
    flowable.process.async.executor.default-timer-job-acquire-wait-time=PT10S # 当没有找到新的定时器作业或获取的异步作业较少时,定时器作业获取线程将等待执行下一个获取查询的时间。默认值 = 10 秒。
    flowable.process.async.executor.max-async-jobs-due-per-acquisition=1 # ???
    flowable.process.async.executor.timer-lock-time=PT5M # 定时器作业被异步执行器获取时锁定的时间量。在此期间,其他异步执行器不会尝试获取和锁定此作业。

    # CMMN https://github.com/flowable/flowable-engine/tree/main/modules/flowable-spring-boot/flowable-spring-boot-starters/flowable-spring-boot-autoconfigure/src/main/java/org/flowable/spring/boot/cmmn/FlowableCmmnProperties.java
    flowable.cmmn.deploy-resources=true # 是否执行资源部署,默认为'true'。
    flowable.cmmn.deployment-name=SpringBootAutoDeployment # CMMN 资源部署的名称。
    flowable.cmmn.enable-safe-xml=true # 启用对解析的 DMN xml 的额外检查。不幸的是,此功能在某些平台上不可用,因此如果你的平台在 XML 解析期间不允许使用 StaxSource,则需要禁用它。
    flowable.cmmn.enabled=true # 是否需要启动 CMMN 引擎。
    flowable.cmmn.resource-location=classpath*:/cases/ # CMMN 资源所在的位置。
    flowable.cmmn.resource-suffixes=**.cmmn,**.cmmn11,**.cmmn.xml,**.cmmn11.xml # 需要扫描的资源的后缀。
    flowable.cmmn.servlet.load-on-startup=-1 # CMMN 调度 servlet 的启动加载。
    flowable.cmmn.servlet.name=Flowable CMMN Rest API # CMMN servlet 的名称。
        flowable.cmmn.servlet.path=/cmmn-api # CMMN rest servlet 的上下文路径。

    # CMMN 异步执行器
    flowable.cmmn.async-executor-activate=true # 是否应该激活异步执行器。
    flowable.cmmn.async.executor.async-job-lock-time=PT5M # 异步作业被异步执行器获取时锁定的时间量。在此期间,其他异步执行器不会尝试获取和锁定此作业。
    flowable.cmmn.async.executor.default-async-job-acquire-wait-time=PT10S # 当没有找到新的异步作业或获取的异步作业较少时,异步作业获取线程将等待执行下一个获取查询的时间。默认值 = 10 秒。
    flowable.cmmn.async.executor.default-queue-size-full-wait-time=PT5S # 当队列已满时,异步作业(定时器和异步延续)获取线程将等待执行下一个查询的时间。
    flowable.cmmn.async.executor.default-timer-job-acquire-wait-time=PT10S # 当没有找到新的定时器作业或获取的异步作业较少时,定时器作业获取线程将等待执行下一个获取查询的时间。默认值 = 10 秒。
    flowable.cmmn.async.executor.max-async-jobs-due-per-acquisition=1 # ???
    flowable.cmmn.async.executor.timer-lock-time=PT5M # 定时器作业被异步执行器获取时锁定的时间量。在此期间,其他异步执行器不会尝试获取和锁定此作业。

    # DMN https://github.com/flowable/flowable-engine/tree/main/modules/flowable-spring-boot/flowable-spring-boot-starters/flowable-spring-boot-autoconfigure/src/main/java/org/flowable/spring/boot/dmn/FlowableDmnProperties.java
    flowable.dmn.deploy-resources=true # 是否执行资源部署,默认为'true'。
    flowable.dmn.deployment-name=SpringBootAutoDeployment # DMN 资源部署的名称。
    flowable.dmn.enable-safe-xml=true # 启用对解析的 DMN xml 的额外检查。不幸的是,此功能在某些平台上不可用,因此如果你的平台在 XML 解析期间不允许使用 StaxSource,则需要禁用它。
    flowable.dmn.enabled=true # 是否需要启动 DMN 引擎。
    flowable.dmn.history-enabled=true # 是否应该为 DMN 引擎启用历史记录。
    flowable.dmn.resource-location=classpath*:/dmn/ # DMN 资源所在的位置。
    flowable.dmn.resource-suffixes=**.dmn,**.dmn.xml,**.dmn11,**.dmn11.xml # 需要扫描的资源的后缀。
    flowable.dmn.servlet.load-on-startup=-1 # DMN 调度 servlet 的启动加载。
    flowable.dmn.servlet.name=Flowable DMN Rest API # DMN servlet 的名称。
    flowable.dmn.servlet.path=/dmn-api # DMN rest servlet 的上下文路径。
    flowable.dmn.strict-mode=true # 如果你想忽略决策表命中策略有效性检查导致决策表状态失败,请将此设置为 false。结果是返回验证错误发生前创建的中间结果。

    # IDM https://github.com/flowable/flowable-engine/tree/main/modules/flowable-spring-boot/flowable-spring-boot-starters/flowable-spring-boot-autoconfigure/src/main/java/org/flowable/spring/boot/idm/FlowableIdmProperties.java
    flowable.idm.enabled=true # 是否需要启动 IDM 引擎。
    flowable.idm.password-encoder= # 需要使用的密码编码器类型。
    flowable.idm.servlet.load-on-startup=-1 # IDM 调度 servlet 的启动加载。
    flowable.idm.servlet.name=Flowable IDM Rest API # IDM servlet 的名称。
    flowable.idm.servlet.path=/idm-api # IDM rest servlet 的上下文路径。

    # IDM Ldap https://github.com/flowable/flowable-engine/tree/main/modules/flowable-spring-boot/flowable-spring-boot-starters/flowable-spring-boot-autoconfigure/src/main/java/org/flowable/spring/boot/ldap/FlowableLdapProperties.java
    flowable.idm.ldap.attribute.email= # 匹配用户邮箱的属性名称。
    flowable.idm.ldap.attribute.first-name= # 匹配用户名字的属性名称。
    flowable.idm.ldap.attribute.group-id= # 匹配组 ID 的属性名称。
    flowable.idm.ldap.attribute.group-name= # 匹配组名称的属性名称。
    flowable.idm.ldap.attribute.group-type= # 匹配组类型的属性名称。
    flowable.idm.ldap.attribute.last-name= # 匹配用户姓氏的属性名称。
    flowable.idm.ldap.attribute.user-id= # 匹配用户 ID 的属性名称。
        flowable.idm.ldap.base-dn= # 用户和组搜索开始的基础"专有名称"(DN)。
    flowable.idm.ldap.cache.group-size=-1 # 允许设置 {@link org.flowable.ldap.LDAPGroupCache} 的大小。这是一个 LRU 缓存,用于缓存用户的组,从而避免每次需要知道用户的组时都要访问 LDAP 系统。
    flowable.idm.ldap.custom-connection-parameters= # 允许设置所有没有专用 setter 的 LDAP 连接参数。例如,参见 http://docs.oracle.com/javase/tutorial/jndi/ldap/jndi.html 了解自定义属性。这些属性例如用于配置连接池、特定安全设置等。
    flowable.idm.ldap.enabled=false # 是否启用 LDAP IDM 服务。
    flowable.idm.ldap.group-base-dn= # 组搜索开始的基础"专有名称"(DN)。
    flowable.idm.ldap.initial-context-factory=com.sun.jndi.ldap.LdapCtxFactory # 初始上下文工厂的类名。
    flowable.idm.ldap.password= # 用于连接 LDAP 系统的密码。
    flowable.idm.ldap.port=-1 # LDAP 系统运行的端口。
    flowable.idm.ldap.query.all-groups= # 搜索所有组时执行的查询。
    flowable.idm.ldap.query.all-users= # 搜索所有用户时执行的查询。
    flowable.idm.ldap.query.groups-for-user= # 搜索特定用户的组时执行的查询。
    flowable.idm.ldap.query.user-by-full-name-like= # 通过全名搜索用户时执行的查询。
    flowable.idm.ldap.query.user-by-id= # 通过 userId 搜索用户时执行的查询。
    flowable.idm.ldap.query.group-by-id= # 通过 groupId 搜索特定组时执行的查询。
    flowable.idm.ldap.search-time-limit=0 # 在 LDAP 中执行搜索时使用的超时时间(毫秒)。默认设置为'0',表示'永久等待'。
    flowable.idm.ldap.security-authentication=simple # 用于连接 LDAP 系统的'java.naming.security.authentication'属性的值。
    flowable.idm.ldap.server= # 可以访问 LDAP 系统的服务器主机。例如'ldap://localhost'。
    flowable.idm.ldap.user= # 用于连接 LDAP 系统的用户 ID。
    flowable.idm.ldap.user-base-dn= # 用户搜索开始的基础"专有名称"(DN)。

    # Flowable Mail https://github.com/flowable/flowable-engine/tree/main/modules/flowable-spring-boot/flowable-spring-boot-starters/flowable-spring-boot-autoconfigure/src/main/java/org/flowable/spring/boot/FlowableMailProperties.java
    flowable.mail.server.default-from=flowable@localhost # 发送邮件时需要使用的默认发件人地址。
    flowable.mail.server.force-to= # 发送邮件时将使用的强制收件人地址。重要提示:如果设置了此项,则所有邮件都将发送到定义的地址,而不是 MailActivity 中配置的地址。
        flowable.mail.server.host=localhost # 邮件服务器的主机。
    flowable.mail.server.password= # 邮件服务器认证的密码。
    flowable.mail.server.port=1025 # 邮件服务器的端口。
    flowable.mail.server.ssl-port=1465 # 邮件服务器的 SSL 端口。
    flowable.mail.server.use-ssl=false # 设置是否在连接时为 SMTP 传输启用 SSL/TLS 加密(SMTPS/POPS)。
    flowable.mail.server.use-tls=false # 设置或禁用 STARTTLS 加密。
    flowable.mail.server.username= # 用于邮件服务器认证的用户名。如果为空则不使用认证。

    # Flowable Http https://github.com/flowable/flowable-engine/tree/main/modules/flowable-spring-boot/flowable-spring-boot-starters/flowable-spring-boot-autoconfigure/src/main/java/org/flowable/spring/boot/FlowableHttpProperties.java
    flowable.http.user-system-properties=false # 是否使用系统属性(例如 http.proxyPort)。
    flowable.http.connect-timeout=5s # http 客户端的连接超时
    flowable.http.socket-timeout=5s # http 客户端的套接字超时
    flowable.http.connection-request-timeout=5s # http 客户端的连接请求超时
    flowable.http.request-retry-limit=3 # http 客户端的请求重试限制
    flowable.http.disable-cert-verify=false # 是否禁用 http 客户端的证书验证

    # Flowable REST
    flowable.rest.app.cors.enabled=true # 是否完全启用 CORS 请求。如果为 false,其他属性将不起作用
    flowable.rest.app.cors.allow-credentials=true # 是否在 CORS 请求中包含凭证
    flowable.rest.app.cors.allowed-origins=* # 接受 CORS 请求的逗号分隔 URL
    flowable.rest.app.cors.allowed-headers=* # 在 CORS 请求中允许的逗号分隔 HTTP 头
    flowable.rest.app.cors.allowed-methods=DELETE,GET,PATCH,POST,PUT # 在 CORS 请求中允许的逗号分隔 HTTP 方法
    flowable.rest.app.cors.exposed-headers=* # 在 CORS 响应中暴露的逗号分隔头列表

    # Actuator
    management.endpoint.flowable.cache.time-to-live=0ms # 响应可以缓存的最长时间。
    management.endpoint.flowable.enabled=true # 是否启用 flowable 端点。


<table>
<caption>已废弃的属性</caption>
<colgroup>
<col style="width: 25%" />
<col style="width: 25%" />
<col style="width: 25%" />
<col style="width: 25%" />
</colgroup>
<thead>
<tr class="header">
<th>属性名称</th>
<th>旧属性</th>
<th>默认值</th>
<th>描述</th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><p>flowable.process.servlet.name</p></td>
<td><p>flowable.rest-api-servlet-name</p></td>
<td><p>Flowable BPMN Rest API</p></td>
<td><p>Process servlet 的名称。</p></td>
</tr>
<tr class="even">
<td><p>flowable.process.servlet.path</p></td>
<td><p>flowable.rest-api-mapping</p></td>
<td><p>/process-api</p></td>
<td><p>Process rest servlet 的上下文路径。</p></td>
</tr>
<tr class="odd">
<td><p>flowable.mail.server.host</p></td>
<td><p>flowable.mail-server-host</p></td>
<td><p>localhost</p></td>
<td><p>邮件服务器的主机地址。</p></td>
</tr>
<tr class="even">
<td><p>flowable.mail.server.password</p></td>
<td><p>flowable.mail-server-password</p></td>
<td><p>-</p></td>
<td><p>邮件服务器认证的密码。</p></td>
</tr>
<tr class="odd">
<td><p>flowable.mail.server.port</p></td>
<td><p>flowable.mail-server-port</p></td>
<td><p>1025</p></td>
<td><p>邮件服务器的端口。</p></td>
</tr>
<tr class="even">
<td><p>flowable.mail.server.ssl-port</p></td>
<td><p>flowable.mail-server-ssl-port</p></td>
<td><p>1465</p></td>
<td><p>邮件服务器的 SSL 端口。</p></td>
</tr>
<tr class="odd">
<td><p>flowable.mail.server.use-ssl</p></td>
<td><p>flowable.mail-server-use-ssl</p></td>
<td><p>false</p></td>
<td><p>设置是否在连接时为 SMTP 传输启用 SSL/TLS 加密(SMTPS/POPS)。</p></td>
</tr>
<tr class="even">
<td><p>flowable.mail.server.use-tls</p></td>
<td><p>flowable.mail-server-use-tls</p></td>
<td><p>false</p></td>
<td><p>设置或禁用 STARTTLS 加密。</p></td>
</tr>
<tr class="odd">
<td><p>flowable.mail.server.username</p></td>
<td><p>flowable.mail-server-user-name</p></td>
<td><p>-</p></td>
<td><p>用于邮件服务器认证的用户名。如果为空则不使用认证。</p></td>
</tr>
<tr class="even">
<td><p>flowable.process.definition-cache-limit</p></td>
<td><p>flowable.process-definitions.cache.max</p></td>
<td><p>-1</p></td>
<td><p>流程定义缓存中可用的最大流程定义数量。默认值为 -1(所有流程定义)</p></td>
</tr>
</tbody>
</table>

## Flowable 自动配置类

以下是 Flowable 提供的所有自动配置类列表，包含文档和源代码的链接。
请记住查看应用程序中的条件报告，以了解更多关于哪些功能已启用的详细信息。
(要查看报告，请使用 --debug 或 -Ddebug 启动应用程序，或在 Actuator 应用程序中使用 conditions 端点)。

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th>配置类</th>
</tr>
</thead>
<tbody>
<tr>
<td><p><a href="https://github.com/flowable/flowable-engine/tree/main/modules/flowable-spring-boot/flowable-spring-boot-starters/flowable-spring-boot-autoconfigure/src/main/java/org/flowable/spring/boot/cmmn/CmmnEngineAutoConfiguration.java">CmmnEngineAutoConfiguration</a></p></td>
</tr>
<tr>
<td><p><a href="https://github.com/flowable/flowable-engine/tree/main/modules/flowable-spring-boot/flowable-spring-boot-starters/flowable-spring-boot-autoconfigure/src/main/java/org/flowable/spring/boot/cmmn/CmmnEngineServicesAutoConfiguration.java">CmmnEngineServicesAutoConfiguration</a></p></td>
</tr>
<tr>
<td><p><a href="https://github.com/flowable/flowable-engine/tree/main/modules/flowable-spring-boot/flowable-spring-boot-starters/flowable-spring-boot-autoconfigure/src/main/java/org/flowable/spring/boot/dmn/DmnEngineAutoConfiguration.java">DmnEngineAutoConfiguration</a></p></td>
</tr>
<tr>
<td><p><a href="https://github.com/flowable/flowable-engine/tree/main/modules/flowable-spring-boot/flowable-spring-boot-starters/flowable-spring-boot-autoconfigure/src/main/java/org/flowable/spring/boot/dmn/DmnEngineServicesAutoConfiguration.java">DmnEngineServicesAutoConfiguration</a></p></td>
</tr>
<tr>
<td><p><a href="https://github.com/flowable/flowable-engine/tree/main/modules/flowable-spring-boot/flowable-spring-boot-starters/flowable-spring-boot-autoconfigure/src/main/java/org/flowable/spring/boot/EndpointAutoConfiguration.java">EndpointAutoConfiguration</a></p></td>
</tr>
<tr>
<td><p><a href="https://github.com/flowable/flowable-engine/tree/main/modules/flowable-spring-boot/flowable-spring-boot-starters/flowable-spring-boot-autoconfigure/src/main/java/org/flowable/spring/boot/actuate/info/FlowableInfoAutoConfiguration.java">FlowableInfoAutoConfiguration</a></p></td>
</tr>
<tr>
<td><p><a href="https://github.com/flowable/flowable-engine/tree/main/modules/flowable-spring-boot/flowable-spring-boot-starters/flowable-spring-boot-autoconfigure/src/main/java/org/flowable/spring/boot/ldap/FlowableLdapAutoConfiguration.java">FlowableLdapAutoConfiguration</a></p></td>
</tr>
<tr>
<td><p><a href="https://github.com/flowable/flowable-engine/tree/main/modules/flowable-spring-boot/flowable-spring-boot-starters/flowable-spring-boot-autoconfigure/src/main/java/org/flowable/spring/boot/idm/IdmEngineAutoConfiguration.java">IdmEngineAutoConfiguration</a></p></td>
</tr>
<tr>
<td><p><a href="https://github.com/flowable/flowable-engine/tree/main/modules/flowable-spring-boot/flowable-spring-boot-starters/flowable-spring-boot-autoconfigure/src/main/java/org/flowable/spring/boot/idm/IdmEngineServicesAutoConfiguration.java">IdmEngineServicesAutoConfiguration</a></p></td>
</tr>
<tr>
<td><p><a href="https://github.com/flowable/flowable-engine/tree/main/modules/flowable-spring-boot/flowable-spring-boot-starters/flowable-spring-boot-autoconfigure/src/main/java/org/flowable/spring/boot/ProcessEngineAutoConfiguration.java">ProcessEngineAutoConfiguration</a></p></td>
</tr>
<tr>
<td><p><a href="https://github.com/flowable/flowable-engine/tree/main/modules/flowable-spring-boot/flowable-spring-boot-starters/flowable-spring-boot-autoconfigure/src/main/java/org/flowable/spring/boot/RestApiAutoConfiguration.java">RestApiAutoConfiguration</a></p></td>
</tr>
</tbody>
</table>

## Flowable Starters

以下是 Flowable Spring Boot starters 的列表。

<table>
<colgroup>
<col style="width: 50%" />
<col style="width: 50%" />
</colgroup>
<thead>
<tr class="header">
<th>Starter</th>
<th>描述</th>
</tr>
</thead>
<tbody>
<tr>
<td><p><a href="https://github.com/flowable/flowable-engine/tree/main/modules/flowable-spring-boot/flowable-spring-boot-starters/flowable-spring-boot-starter-cmmn/pom.xml">flowable-spring-boot-starter-cmmn</a></p></td>
<td><p>包含在独立模式下启动 CMMN 引擎所需的依赖</p></td>
</tr>
<tr>
<td><p><a href="https://github.com/flowable/flowable-engine/tree/main/modules/flowable-spring-boot/flowable-spring-boot-starters/flowable-spring-boot-starter-cmmn-rest/pom.xml">flowable-spring-boot-starter-cmmn-rest</a></p></td>
<td><p>包含在独立模式下启动 CMMN 引擎并启动其 REST API 所需的依赖</p></td>
</tr>
<tr>
<td><p><a href="https://github.com/flowable/flowable-engine/tree/main/modules/flowable-spring-boot/flowable-spring-boot-starters/flowable-spring-boot-starter-dmn/pom.xml">flowable-spring-boot-starter-dmn</a></p></td>
<td><p>包含在独立模式下启动 DMN 引擎所需的依赖</p></td>
</tr>
<tr>
<td><p><a href="https://github.com/flowable/flowable-engine/tree/main/modules/flowable-spring-boot/flowable-spring-boot-starters/flowable-spring-boot-starter-dmn-rest/pom.xml">flowable-spring-boot-starter-dmn-rest</a></p></td>
<td><p>包含在独立模式下启动 DMN 引擎并启动其 REST API 所需的依赖</p></td>
</tr>
<tr>
<td><p><a href="https://github.com/flowable/flowable-engine/tree/main/modules/flowable-spring-boot/flowable-spring-boot-starters/flowable-spring-boot-starter-process/pom.xml">flowable-spring-boot-starter-process</a></p></td>
<td><p>包含在独立模式下启动流程引擎所需的依赖</p></td>
</tr>
<tr>
<td><p><a href="https://github.com/flowable/flowable-engine/tree/main/modules/flowable-spring-boot/flowable-spring-boot-starters/flowable-spring-boot-starter-process-rest/pom.xml">flowable-spring-boot-starter-process-rest</a></p></td>
<td><p>包含在独立模式下启动流程引擎并启动其 REST API 所需的依赖</p></td>
</tr>
<tr>
<td><p><a href="https://github.com/flowable/flowable-engine/tree/main/modules/flowable-spring-boot/flowable-spring-boot-starters/flowable-spring-boot-starter/pom.xml">flowable-spring-boot-starter</a></p></td>
<td><p>包含启动所有 Flowable 引擎(Process、CMMN、DMN 和 IDM)所需的依赖</p></td>
</tr>
<tr>
<td><p><a href="https://github.com/flowable/flowable-engine/tree/main/modules/flowable-spring-boot/flowable-spring-boot-starters/flowable-spring-boot-starter-rest/pom.xml">flowable-spring-boot-starter-rest</a></p></td>
<td><p>包含启动所有 Flowable 引擎及其各自的 REST API 所需的依赖</p></td>
</tr>
<tr>
<td><p><a href="https://github.com/flowable/flowable-engine/tree/main/modules/flowable-spring-boot/flowable-spring-boot-starters/flowable-spring-boot-starter-actuator/pom.xml">flowable-spring-boot-starter-actuator</a></p></td>
<td><p>包含 Spring Boot 所需的依赖</p></td>
</tr>
</tbody>
</table>

## 使用 Liquibase

Flowable 引擎使用 Liquibase 来管理其表的版本控制。
这意味着 Spring Boot 的 `LiquibaseAutoConfiguration` 会自动启动。
但是，如果你不使用 Liquibase，应用程序将无法启动并会抛出异常。
因此，Flowable 将 `spring.liquibase.enabled` 设置为 `false`，这意味着如果你需要使用 Liquibase，你必须显式启用它。

## 延伸阅读

显然，还有很多 Spring Boot 的内容尚未涉及，比如非常简单的 JTA 集成或构建可在主要应用服务器上运行的 WAR 文件。Spring Boot 集成还有更多内容：

-   Actuator 支持

-   Spring Integration 支持

-   REST API 集成：在 Spring 应用程序中启动嵌入式 Flowable REST API

-   Spring Security 支持

## 高级配置

### 自定义引擎配置

可以通过实现 *org.flowable.spring.boot.EngineConfigurationConfigurer&lt;T&gt;* 接口来获取引擎配置。
其中 *T* 是特定引擎配置的 Spring 类型。
这对于高级配置设置或仅仅因为某个属性尚未暴露（还）而言很有用。
例如：

    public class MyConfigurer implements EngineConfigurationConfigurer<SpringProcessEngineConfiguration> {

        public void configure(SpringProcessEngineConfiguration processEngineConfiguration) {
            // 高级配置
        }

    }

通过在 Spring Boot 配置中将此类的实例作为 *@Bean* 暴露，该实例将在流程引擎完全创建之前被调用。

> **提示**
>
> 你可以使用此方法提供 Flowable Service 的自定义实现。参见 https://github.com/flowable/flowable-engine/tree/main/modules/flowable-spring-boot/flowable-spring-boot-starters/flowable-spring-boot-autoconfigure/src/main/java/org/flowable/spring/boot/ldap/FlowableLdapAutoConfiguration.java\[FlowableLdapAutoConfiguration\]

### 组合 starters

如果你只需要引擎的某种组合，那么你只需添加所需的依赖项。
例如，要使用 Process、CMMN 和 IDM 引擎并使用 LDAP，你需要添加以下依赖：

    <dependency>
        <groupId>org.flowable</groupId>
        <artifactId>flowable-spring-boot-starter-process</artifactId>
        <version>${flowable.version}</version>
    </dependency>
    <dependency>
        <groupId>org.flowable</groupId>
        <artifactId>flowable-spring-boot-starter-cmmn</artifactId>
        <version>${flowable.version}</version>
    </dependency>
    <dependency>
        <groupId>org.flowable</groupId>
        <artifactId>flowable-ldap</artifactId>
        <version>${flowable.version}</version>
    </dependency>

### 配置异步执行器

Process 和 CMMN 引擎都有专用的 `AsyncExecutor`，它们可以通过 `flowable.{engine}.async.executor` 属性组进行配置。
其中 `engine` 可以是 `process` 或 `cmmn`。

默认情况下，`AsyncExecutor` 共享相同的 Spring `TaskExecutor` 和 `SpringRejectedJobsHandler`。
如果你想为每个引擎提供专用的执行器，你需要使用 `@Process` 和 `@Cmmn` 定义限定的 bean。

你可以按以下方式配置自定义执行器：

    @Configuration
    public class MyConfiguration {

        @Process 
        @Bean
        public TaskExecutor processTaskExecutor() {
            return new SimpleAsyncTaskExecutor();
        }

        @Cmmn 
        @Bean
        public TaskExecutor cmmnTaskExecutor() {
            return new SyncTaskExecutor();
        }
    }

-   Process 引擎的异步执行器将使用 `SimpleAsyncTaskExecutor`

-   CMMN 引擎的异步执行器将使用 `SyncTaskExecutor`

> **重要**
>
> 如果你定义了自定义 `TaskExecutor` bean，Flowable 将不会触发 bean 的创建。
> 这意味着如果你定义了一个用 `@Process` 限定的 bean，你必须定义一个带有 `@Cmmn` 或 `@Primary` 的 bean，否则 CMMN 异步执行器将使用 Process 的执行器