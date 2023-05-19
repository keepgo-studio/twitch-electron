import { LitElement } from "lit";
import { customElement } from "lit/decorators.js";

@customElement("view-player")
class Player extends LitElement {
  
}

`
<html>
<body>
  <!-- Add a placeholder for the Twitch embed -->
  <div id="twitch-embed"></div>

  <!-- Load the Twitch embed JavaScript file -->
  <script src="https://embed.twitch.tv/embed/v1.js"></script>

  <!-- Create a Twitch.Embed object that will render within the "twitch-embed" element -->
  <script type="text/javascript">
    new Twitch.Embed("twitch-embed", {
      width: 1200,
      height: 800,
      layout: "video",
      channel: "handongsuk",
      // theme: "light",
      // Only needed if this page is going to be embedded on other websites
      parent: []
    });
  </script>

<!-- https://discuss.dev.twitch.tv/t/embedding-twitch-chat-with-dark-mode-and-parent/37488 -->
  <iframe id="twitch-chat-embed"
      src="https://www.twitch.tv/embed/handongsuk/chat?darkpopout&parent=localhost"
      height="500"
      width="350">
  </iframe>

  <script>
      document.querySelector(Twitch.Embed.VIDEO_READY, () => {
          
      })
  </script>
</body>
</html>
`