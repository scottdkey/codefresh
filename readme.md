# Codefresh Pipeline Container Tags

Naming containers for various teams can sometimes be all over the place. Different teams from the same organization could be using different schemas. 

What kinds of versioning make sense in a CI/CD world? What makes sense to use with Kubernetes? How do we ensure each container image is truly unique, so Kubernetes will represent our correct state?

## Semantic Versioning
Semantic versioning is everywhere. It has been the gold standard for quite a few years now. There is even an [organization](https://semver.org) help define standards and practices. Semantic Versioning v2.0 follows the template of:

`major:minor:patch`
i.e. `1.4.2`
- `major` is generally breaking changes anywhere inside the commit
- `minor` is some kind of new feature or altering certain libraries without changing the apis
 - `patch` is usually something like bug fixes or someone running through the project fixing typos


This has served us well, it has some very distinct advantages over some of the later methods. 
- Its human readable. Anyone looking at a version of software will be easily able to parse and figure out which version came first. 
- It is very easy to know when to expect potential breaking changes for anyone consuming the code.
- Differentiating for specific rollout strategies like canary or blue/green style deployments

Some major downsides of SemVer 2.0 are:
- Kubernetes doesn't differentiate between any container updates without a specific container to hook onto.
  - i.e. `1.0.1` pushed at 2pm is the same container as `1.0.1` at 5pm. Its not something we should be doing, but we all know it happens. 
- It becomes a problem of combining lots of little updates into a particular patch version. 

<p>
Its important that semantic versioning is part of distributable software for a long time to come. Knowing which version to run can make or break certain builds.
</p>

`./semver.codefresh.yml`
```
version: "1.0"
stages:
  - "clone"
  - "version"
  - "test"
  - "build"
steps:
  clone:
    title: "Cloning repository"
    type: "git-clone"
    repo: "scottdkey/codefresh"
    revision: "${{CF_BRANCH}}"
    git: "github"
    stage: "clone"

  version:
    title: "Package.json version"
    type: "freestyle"
    image: "node:current-alpine3.11"
    working_directory: "${{clone}}"
    commands:
      - cf_export PKG_VERSION=$(node -p "require('./package.json').version")
    stage: "version"

  test:
    title: "Unit tests"
    type: "freestyle"
    image: "node:current-alpine3.11"
    working_directory: "${{clone}}"
    commands:
      - yarn
      - yarn test
    stage: "test"

  build:
    title: "Building Docker image"
    type: "build"
    image_name: "scottdkey/codefresh"
    working_directory: "${{clone}}"
    tags: ["${{PKG_VERSION}}"]
    dockerfile: "Dockerfile"
    stage: "build"
  ```

In this simple example we are pulling this repository, getting our package.json Version number(semantic version) and, running some simple tests, and building the docker image and pushing it to DockerHub. 

We are getting that version into our codefresh pipeline by using `cf_export` to inject that into our codefresh build environment. We are then using that as our tag later on in the build phase.

## Git Hash

For many of us version control is synonymous with git. For good reason. 

Each commit we push to a repository will generate a git hash. It's a 160 big SHA-1 string calculated from your repo contents. If you change so much as a `!` anywhere in the committed code you will get a unique identifier. I'm sure I'll get comments saying its not truly unique, it just has a really high chance of avoiding collisions. So it is **effectively** unique. So we'll leave it there.

Some great things about using a git hash to version our builds are:
- Automatically generated on each commit
- Unique to the current state of the repository
- Tied directly to files and state of files in the repository

You get a couple of downsides, the most major one would be that it is difficult for humans to know the order of releases. If you are utilizing a full CI/CD pipeline this doesn't matter as much because everything we're doing is programmatic. 

We can pinpoint exactly when something went wrong but looking at our merge history, if a group commits several times a day, semantic versioning sometimes isn't the best choice. Its generally a great idea to use these in tandem, with specific organizational reasons pertaining to each version update, even if they are a `patch` update. 

Codefresh will automatically put this value into the pipeline environment variable for us to use. this is references with `CF_Revision` or even `CF_SHORT_REVISION`. The second one is sort of self explanatory, it will only produce the first 7 characters in the hash.

`./hash.codefresh.yml`

```
version: "1.0"
stages:
  - "clone"
  - "test"
  - "build"
steps:
  clone:
    title: "Cloning repository"
    type: "git-clone"
    repo: "scottdkey/codefresh"
    revision: "${{CF_BRANCH}}"
    git: "github"
    stage: "clone"

  test:
    title: "Unit tests"
    type: "freestyle"
    image: "node:current-alpine3.11"
    working_directory: "${{clone}}"
    commands:
      - yarn
      - yarn test
    stage: "test"

  build:
    title: "Building Docker image"
    type: "build"
    image_name: "scottdkey/codefresh"
    working_directory: "${{clone}}"
    tags: ["${{CF_SHORT_REVISION}}"]
    dockerfile: "Dockerfile"
    stage: "build"
```
You'll notice that this build removes the version step. It doesn't change a lot of whats going on, but it does provide a cleaner syntax. Now when we run the same build we will generate an image with our short hash.

## Codefresh CF_Build_ID

A build ID can be very useful as well. Instead of our unique ID being tied to the state of our repository or SemVer its tied directly to the pipeline and current build process. When trying to pinpoint errors with our build process or when facing a monorepo it can be great to precisely trace issues for each piece of the puzzle, it helps find issues early and often if used correctly.

```
version: "1.0"
stages:
  - "clone"
  - "test"
  - "build"
steps:
  clone:
    title: "Cloning repository"
    type: "git-clone"
    repo: "scottdkey/codefresh"
    revision: "${{CF_BRANCH}}"
    git: "github"
    stage: "clone"

  test:
    title: "Unit tests"
    type: "freestyle"
    image: "node:current-alpine3.11"
    working_directory: "${{clone}}"
    commands:
      - yarn
      - yarn test
    stage: "test"

  build:
    title: "Building Docker image"
    type: "build"
    image_name: "scottdkey/codefresh"
    working_directory: "${{clone}}"
    tags: ["${{CF_BUILD_ID}}"]
    dockerfile: "Dockerfile"
    stage: "build"
```


## Multi-Tag builds

There are unique advantages and disadvantages to each method we've covered. But some of the real power of great build tool is the ability to automate various parts of it. Here, we can tag the same image in various ways for various uses later in our pipeline. We can be dealing with as many versions as needed at any time for any pipeline requirements, such as:
- auto staging q/a environments based on git hash
- automated version promotion
- pretty much anything you can come up with

We've been building our Codefresh pipeline separately, but to include everything we could want in a single file.

`codefresh.yml`

```
version: "1.0"
stages:
  - "clone"
  - "version"
  - "test"
  - "build"
steps:
  clone:
    title: "Cloning repository"
    type: "git-clone"
    repo: "scottdkey/codefresh"
    revision: "${{CF_BRANCH}}"
    git: "github"
    stage: "clone"

  version:
    title: "Package.json version"
    type: "freestyle"
    image: "node:current-alpine3.11"
    working_directory: "${{clone}}"
    commands:
      - cf_export PKG_VERSION=$(node -p "require('./package.json').version")
    stage: "version"

  test:
    title: "Unit tests"
    type: "freestyle"
    image: "node:current-alpine3.11"
    working_directory: "${{clone}}"
    commands:
      - yarn
      - yarn test
    stage: "test"

  build:
    title: "Building Docker image"
    type: "build"
    image_name: "scottdkey/codefresh"
    working_directory: "${{clone}}"
    tags: ["latest", "${{PKG_VERSION}}-rc1", "${{PKG_VERSION}}", "${{CF_SHORT_REVISION}}", "${{CF_BUILD_ID}}"]
    dockerfile: "Dockerfile"
    stage: "build"
```

Since Codefresh uses a tags array you can append as many, or as few versions to upload to git hub. You can separate out builds into multi part builds. 


Thanks for reading!