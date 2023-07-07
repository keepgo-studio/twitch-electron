const data: PlayerLangMap = {
  "twitchAuth": {
    "reAuth": {
      "h3Token": "토큰이 만료되었습니다.",
      "h3Profile": "다시 권한을 주려면..."
    },
    "newAuth": {
      "h3Auth": "새로운 유저 추가하기"
    },
    "requestBtn": "권한 가져오기"
  },
  "main": {
    "all": "전체",
    "etc": "그 외",
    "alertAddNewGroup": {
      "header": "오류",
      "body": "이미 있는 그룹 이름입니다"
    },
    "alertChangeGroupName": {
      "header": "오류",
      "body": "이미 있는 그룹 이름입니다"
    },
    "alertAllEtcChangeGroupName": {
      "all": {
        "header": "이런!",
        "body": "그룹 '전체'는 이름을 바꿀 수 없어요..."
      },
      "etc": {
        "header": "이런!",
        "body": "그룹 '그 외'는 이름을 바꿀 수 없어요..."
      }
    },
    "alertAllChangeColor": {
      "header": "이런!",
      "body": "그룹 '전체'는 색깔을 바꿀 수 없어요..."
    },
    "conformRemoveGroup": {
      "header": "그룹 삭제:",
      "body": "이 그룹을 정말 삭제하시겠습니까? (채널들은 '그 외'로 이동합니다.)"
    },
    "promptAddNewGroup": {
      "header": "그룹 생성",
      "body": "새로운 그룹을 위한 이름을 만들어 주세요!"
    },
    "promptChangeGroupName": {
      "header": "그룹 이름 변경",
      "body": "변경하고 싶은 이름을 입력해 주세요!"
    }
  },
  dialog: {
    confirm: {
      cancel: "취소",
      confirm: "확인"
    },
    prompt: {
      cancel: "취소",
      confirm: "확인"
    },
    alert: {
      confirm: "확인"
    },
    colorPicker: {
      h1: "색깔 고르기",
      p: "원하는 색으로 변경하세요",
      cancel: "취소",
      confirm: "변경"
    },
    addChannels: {
      h3: "그룹에 추가하기",
      cancel: "취소",
      confirm: "추가하기"
    }
  }
};

export default data;