<template>
  <div class="home">
    <!-- <script src="https://jssip.net/download/releases/jssip-3.4.2.js"></script> -->
    <div id="wrapper">
      <div id="incomingCall">
        <div class="callInfo">
          <h3>Incoming Call</h3>
          <p id="incomingCallNumber">Unknown</p>
        </div>
        <div id="answer">
          <i class="fa fa-phone"></i>
        </div>
        <div id="reject">
          <i class="fa fa-phone"></i>
        </div>
      </div>
      <div id="callStatus" style="">
        <div class="callInfo">
          <h3 id="callInfoText">info text goes here</h3>
          <p id="callInfoNumber">info number goes here</p>
        </div>
        <div id="hangUp">
          <i class="fa fa-phone"></i>
        </div>
      </div>
      <!---------TO FIELD---------------------------------------------------->
      <!---------DIALPAD---------------------------------------------------->
      <div id="inCallButtons">
        <div id="dialPad">
          <div class="dialpad-char" data-value="1" unselectable="on">1</div>
          <div class="dialpad-char" data-value="2" unselectable="on">2</div>
          <div class="dialpad-char" data-value="3" unselectable="on">3</div>
          <div class="dialpad-char" data-value="4" unselectable="on">4</div>
          <div class="dialpad-char" data-value="5" unselectable="on">5</div>
          <div class="dialpad-char" data-value="6" unselectable="on">6</div>
          <div class="dialpad-char" data-value="7" unselectable="on">7</div>
          <div class="dialpad-char" data-value="8" unselectable="on">8</div>
          <div class="dialpad-char" data-value="9" unselectable="on">9</div>
          <div class="dialpad-char" data-value="*" unselectable="on">*</div>
          <div class="dialpad-char" data-value="0" unselectable="on">0</div>
          <div class="dialpad-char" data-value="#" unselectable="on">#</div>
        </div>
        <div id="mute">
          <i id="muteIcon" class="fa fa-microphone">></i>
        </div>
      </div>

      <!---------DIAL CONTROLS-------------------------------------------->
      <div id="callControl">
        <div id="to">
          <input id="toField" type="text" placeholder="Enter number here" />
        </div>
        <div id="connectCall">
          <i class="fa fa-phone">☎</i>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "Home",
};
</script>
<style lang="less" scoped>
@import './home.less';
</style>
