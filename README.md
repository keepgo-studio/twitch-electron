
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