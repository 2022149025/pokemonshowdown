"use strict";function _inheritsLoose(t,o){t.prototype=Object.create(o.prototype),t.prototype.constructor=t,_setPrototypeOf(t,o);}function _setPrototypeOf(t,e){return _setPrototypeOf=Object.setPrototypeOf?Object.setPrototypeOf.bind():function(t,e){return t.__proto__=e,t;},_setPrototypeOf(t,e);}






var PSRouter=new(function(_PSModel){





function _class(){var _this;
_this=_PSModel.call(this)||this;_this.baseLoc=void 0;_this.leftLoc=null;_this.rightLoc=null;_this.forceSinglePanel=false;_this.stickyRight=true;
var baseLocSlashIndex=document.location.href.lastIndexOf('/');
_this.baseLoc=document.location.href.slice(0,baseLocSlashIndex+1);
if(Net.defaultRoute){
_this.baseLoc=document.location.href.replace(/#.*/,'')+'#';
}
_this.go(document.location.href);
_this.setSinglePanel(true);
if(window.history)window.addEventListener('popstate',function(e){
PSRouter.popState(e);
_this.update();
});
window.onresize=function(){
PSRouter.setSinglePanel();
};return _this;
}_inheritsLoose(_class,_PSModel);var _proto=_class.prototype;_proto.
showingLeft=function showingLeft(){
return this.leftLoc!==null&&(!this.forceSinglePanel||this.rightLoc===null);
};_proto.
showingRight=function showingRight(){
return this.rightLoc!==null;
};_proto.
href=function href(route){
return""+(Net.defaultRoute?'#':route!=null&&route.startsWith('?')?'./':'')+(route||'')||'.';
};_proto.
setSinglePanel=function setSinglePanel(init){
var singlePanel=window.innerWidth<1300;
var stickyRight=window.innerHeight>614;
if(this.forceSinglePanel!==singlePanel||this.stickyRight!==stickyRight){
this.forceSinglePanel=singlePanel;
this.stickyRight=stickyRight;
if(!init)this.update();
}
};_proto.
push=function push(href){
if(!href.startsWith(this.baseLoc))return false;

if(this.go(href)){var _window$history;
(_window$history=window.history)==null||_window$history.pushState([this.leftLoc,this.rightLoc],'',href);
}
return true;
};_proto.

go=function go(href){
if(!href.startsWith(this.baseLoc)&&href+'#'!==this.baseLoc)return false;

var loc=href.slice(this.baseLoc.length);
if(!loc||loc.startsWith('?')){
this.leftLoc=loc;
if(this.forceSinglePanel){
this.rightLoc=null;
}else{
return this.rightLoc===null;
}
}else{
this.rightLoc=loc;
}
return true;
};_proto.
replace=function replace(loc){
var href=this.baseLoc+loc;
if(this.go(href)){var _window$history2;
(_window$history2=window.history)==null||_window$history2.replaceState([this.leftLoc,this.rightLoc],'',href);
}
return true;
};_proto.
popState=function popState(e){
if(Array.isArray(e.state)){
var _e$state=e.state,leftLoc=_e$state[0],rightLoc=_e$state[1];
this.leftLoc=leftLoc;
this.rightLoc=rightLoc;
if(this.forceSinglePanel)this.leftLoc=null;
}else{
this.leftLoc=null;
this.rightLoc=null;
this.go(document.location.href);
}
this.update();
};return _class;}(PSModel))(
);var

PSReplays=function(_preact$Component){function PSReplays(){return _preact$Component.apply(this,arguments)||this;}_inheritsLoose(PSReplays,_preact$Component);PSReplays.

updateDarkMode=function updateDarkMode(){
var dark=this.darkMode==='dark'?'dark':'';
if(this.darkMode==='auto'){
dark=window.matchMedia!=null&&window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'';
}
document.documentElement.className=dark;
};var _proto2=PSReplays.prototype;_proto2.
componentDidMount=function componentDidMount(){var _this2=this;
PSRouter.subscribe(function(){return _this2.forceUpdate();});
if(window.history){
this.base.addEventListener('click',function(e){
var el=e.target;
for(;el;el=el.parentNode){
if(el.tagName==='A'&&PSRouter.push(el.href)){
e.preventDefault();
e.stopImmediatePropagation();
_this2.forceUpdate();
return;
}
}
});
}

Net("https://"+Config.routes.client+"/config/colors.json").get().then(function(response){
var data=JSON.parse(response);
Object.assign(Config.customcolors,data);
});
};_proto2.
render=function render(){
var position=PSRouter.showingLeft()&&PSRouter.showingRight()&&!PSRouter.stickyRight?
{display:'flex',flexDirection:'column',justifyContent:'flex-end'}:{};
return preact.h("div",{
"class":'bar-wrapper'+(PSRouter.showingLeft()&&PSRouter.showingRight()?' has-sidebar':''),style:position},

PSRouter.showingLeft()&&preact.h(SearchPanel,{id:PSRouter.leftLoc}),
PSRouter.showingRight()&&preact.h(BattlePanel,{id:PSRouter.rightLoc}),
preact.h("div",{style:{clear:'both'}})
);
};return PSReplays;}(preact.Component);PSReplays.darkMode='auto';


preact.render(preact.h(PSReplays,null),document.getElementById('main'));

if(window.matchMedia!=null&&window.matchMedia('(prefers-color-scheme: dark)').matches){
document.documentElement.className='dark';
}
window.matchMedia==null?void 0:window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change',function(event){
if(PSReplays.darkMode==='auto')document.documentElement.className=event.matches?"dark":"";
});
//# sourceMappingURL=replays.js.map