const data: PlayerLangMap = {
  "twitchAuth": {
    "reAuth": {
      "h3Token": "Token expired",
      "h3Profile": "Authorization again with"
    },
    "newAuth": {
      "h3Auth": "Add new user"
    },
    "requestBtn": "REQUEST AUTH"
  },
  "main": {
    "all": "all",
    "etc": "etc",
    "alertAddNewGroup": {
      "header": "Error",
      "body": "already exist group name."
    },
    "alertChangeGroupName": {
      "header": "Error",
      "body": "already exist group name."
    },
    "alertAllEtcChangeGroupName": {
      "all": {
        "header": "Oops!",
        "body": "you cannot change name for group 'all'"
      },
      "etc": {
        "header": "Oops!",
        "body": "you cannot change name for group 'etc'"
      }
    },
    "alertAllChangeColor": {
      "header": "Oops!",
      "body": "Cannot change color for 'all'"
    },
    "conformRemoveGroup": {
      "header": "Removing Group", 
      "body": "Do you really want to remove this group? (channels will move to group 'etc')"
    },
    "promptAddNewGroup": {
      "header": "New group",
      "body": "type new group's name as you wish!"
    },
    "promptChangeGroupName": {
      "header": "Change Group Name",
      "body": "type different group's name as you wish!"
    }
  },
  dialog: {
    confirm: {
      cancel: "Cancel",
      confirm: "Ok"
    },
    prompt: {
      cancel: "Cancel",
      confirm: "Ok"
    },
    alert: {
      confirm: "Ok"
    },
    colorPicker: {
      h1: "Select Colors",
      p: "pick color you want to change",
      cancel: "Cancel",
      confirm: "Confirm"
    },
    addChannels: {
      h3: "Add channels to Group",
      cancel: "Cancel",
      confirm: "Append"
    }
  }
}

export default data;