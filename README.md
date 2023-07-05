<!-- 
+ player 기능 추가하려면
https://dev.twitch.tv/docs/embed/video-and-clips/

View 철학

어떤 논리로 가지고 있으면 안 됌
하나의 state actor로서 받은 데이터를 보여주고, 처리할 call만 보낼 수 있음

  window.user을 없앤 이유가 이것이다.


access token check flow

App.state.ts 참고 (actions들은 App.ts참고);

1.app에서 idb조회
2. idb에 accesstoken이 없거나 유효하지 않으면 web에 요청 버튼 생성
3. 버튼을 누르면 web에 열리고 authorization 진행
4. auth 성공 후 preload통해서 index.ts에게 전달
5. index.ts는 worker에게 저장시키라고 명령
  index.ts은 전달받은 access token을 app에게 전달

만약 2번에서 유효하면 바로 main views생성


localserver가 src기준으로 serve

app file naming
view 내 view들 
  
  tag name: view-{filename to kebob case}
  
  filename: camel case

  classname: {filename}

component내 view들

  tag name: component-{filename to kebob case}
  
  filename: camel case

  classname: {filename}


신기하게 아래 코드를 통해 transition이 한번만 실행된다
```js
setTimeout(() => {
      console.log("change")
      this._service.send("token is")
      this._service.send("request data to worker")
      this._service.send("first complete")
    }, 2000)
```


도저히 못 찾겠다..
지금 기술적으로 불가능한 것은

팔로우 신청/취소
트위치 플레이어내 신청/취소

트위치가 공식적으로 api endpoint외의 것들은 다 끊어버림 (gql같은거)

그래서 그냥 제한적으로 서비스 제공하자

component간 소통은 필요없다. 그냥 reactive variable와 custom event handler로 핸들링하면 되는데!


response body관련
https://stackoverflow.com/questions/67593519/how-can-i-get-response-body-response-text-in-electron-from-headers


<!-- chrome API에서 webRequest를 통해 response body를 가져오는 방법을 아는데
같은 크로미움 엔진을 쓰는 electron이 이 body를 제공하지 않는다길래 적잖아 당홯하고 시간을 엄청 허비했다 (3~4시간)
근데... 그냥 type checking무시하고 사용하니 해결됐다 ㅡㅡ --> -->

<!-- player에서 완전히 새로운 channel을 추가하는 시나리오는 제외한다. 내 생각에는 불가능하다고 생각 -->

## Naming rules

components which are used as view => 

```js
  @customElement("view-*");
```

components which are used as reusable components => 

```js
  @customElemtn("component-*")
```

## caution

addWorkerListner should strictly type checking needed

### Needs

⭐️**Group removing feature**⭐️

Error handlig needed if group name didn't exist in idb

Websocket subscription for each broadcaster

publish app

websites for deploy and contact
