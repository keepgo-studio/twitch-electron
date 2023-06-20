// import { LitElement, html } from "lit";
// import { customElement, property } from "lit/decorators.js";
// import { repeat } from "lit/directives/repeat.js";

// import "@views/main/group/channel/Channel";

// @customElement("view-group")
// class Group extends LitElement {
//   @property()
//   data?: TotalData

//   @property()
//   groupId?: number

//   openPlayer() {

//   }

//   render() {
//     if (this.data === undefined || this.groupId === undefined) {
//       return html`
//         <section>
//           400 Error
//         </section>
//       `
//     }
    
//     const groupHTML = (group: TGroup) => {
//       const channels = group.channels.map(channelId => this.data!.follow_list.find(({ broadcaster_id }) => broadcaster_id === channelId)!);

//       return html`
//         <ul>
//           ${repeat(
//             channels, 
//             (channel) => channel.broadcaster_id,
//             (channel) => html`
//               <li>
//                 ${channel.broadcaster_name}
//               </li>
//             `)}
//         </ul>
//       `;
//     }

//     return html`
//       <section>
//         ${groupHTML(this.data.group_list[this.groupId])}
//       </section>
//     `;
//   }
// }