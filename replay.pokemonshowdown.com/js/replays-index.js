"use strict";function _inheritsLoose(t,o){t.prototype=Object.create(o.prototype),t.prototype.constructor=t,_setPrototypeOf(t,o);}function _setPrototypeOf(t,e){return _setPrototypeOf=Object.setPrototypeOf?Object.setPrototypeOf.bind():function(t,e){return t.__proto__=e,t;},_setPrototypeOf(t,e);}

















function ReplayLink(props)



{
var user=props.user;
var replay=props.replay;
var viewpointSwitched=toID(replay.players[1])===user;
var url=replay.id+(replay.password?"-"+replay.password+"pw":'')+(
viewpointSwitched||props.switched?'?p2':'');

return preact.h("a",{href:PSRouter.href(url),"class":"blocklink"},
preact.h("small",null,replay.format,replay.rating?" (Rating: "+replay.rating+")":'',preact.h("br",null)),
!!replay["private"]&&preact.h("i",{"class":"fa fa-lock","aria-hidden":true})," ",
preact.h("strong",null,replay.players[0])," vs. ",preact.h("strong",null,replay.players[1]),
props.children&&preact.h("small",null,preact.h("br",null),
props.children
)
);
}var

SearchPanel=function(_preact$Component){function SearchPanel(){var _this;for(var _len=arguments.length,args=new Array(_len),_key=0;_key<_len;_key++){args[_key]=arguments[_key];}_this=_preact$Component.call.apply(_preact$Component,[this].concat(args))||this;_this.
results=null;_this.
resultError=null;_this.
format='';_this.
user='';_this.
isPrivate=false;_this.
byRating=false;_this.
page=1;_this.
loggedInUser=null;_this.
loggedInUserIsSysop=false;_this.
sort='date';_this.















































































































submitForm=function(e){var _querySelector,_querySelector2,_querySelector3;
e.preventDefault();
var format=((_querySelector=_this.base.querySelector('input[name=format]'))==null?void 0:_querySelector.value)||'';
var user=((_querySelector2=_this.base.querySelector('input[name=user]'))==null?void 0:_querySelector2.value)||'';
var isPrivate=!((_querySelector3=_this.base.querySelector('input[name=private]'))!=null&&_querySelector3.checked);
_this.search(user,format,isPrivate);
};_this.
cancelForm=function(e){
e.preventDefault();
_this.search('','');
};_this.
searchLoggedIn=function(e){
if(!_this.loggedInUser)return;
_this.base.querySelector('input[name=user]').value=_this.loggedInUser;
_this.submitForm(e);
};return _this;}_inheritsLoose(SearchPanel,_preact$Component);var _proto=SearchPanel.prototype;_proto.componentDidMount=function componentDidMount(){var _this2=this;if(!Net.defaultRoute)Net("/api/replays/check-login").get().then(function(result){if(!result.startsWith(']'))return;var _result$slice$split=result.slice(1).split(','),userid=_result$slice$split[0],sysop=_result$slice$split[1];_this2.loggedInUser=userid;_this2.loggedInUserIsSysop=!!sysop;_this2.forceUpdate();});this.updateSearch(Net.decodeQuery(this.props.id));};_proto.componentDidUpdate=function componentDidUpdate(previousProps){if(this.props.id===previousProps.id)return;var query=Net.decodeQuery(this.props.id);var page=parseInt(query.page||'1');var byRating=query.sort==='rating';if(page!==this.page||byRating!==this.byRating)this.updateSearch(query);};_proto.updateSearch=function updateSearch(query){var user=query.user||'';var format=query.format||'';var page=parseInt(query.page||'1');var isPrivate=!!query["private"];this.byRating=query.sort==='rating';this.search(user,format,isPrivate,page);};_proto.parseResponse=function parseResponse(response,isPrivate){this.results=null;this.resultError=null;if(isPrivate){if(!response.startsWith(']')){this.resultError="Unrecognized response: "+response;return;}response=response.slice(1);}var results=JSON.parse(response);if(!Array.isArray(results)){this.resultError=results.actionerror||"Unrecognized response: "+response;return;}this.results=results;};_proto.search=function search(user,format,isPrivate){var _this3=this;var page=arguments.length>3&&arguments[3]!==undefined?arguments[3]:1;this.base.querySelector('input[name=user]').value=user;this.base.querySelector('input[name=format]').value=format;this.base.querySelectorAll('input[name=private]')[isPrivate?1:0].checked=true;if(!format&&!user)return this.recent();this.user=user;this.format=format;this.isPrivate=!!isPrivate;this.page=page;this.results=null;this.resultError=null;if(user||!format)this.byRating=false;if(!format&&!user){PSRouter.replace('');}else{PSRouter.replace('?'+Net.encodeQuery({user:user||undefined,format:format||undefined,"private":isPrivate?'1':undefined,page:page===1?undefined:page,sort:this.byRating?'rating':undefined}));}this.forceUpdate();Net("/api/replays/"+(isPrivate?'searchprivate':'search')).get({query:{username:this.user,format:this.format,page:page,sort:this.byRating?'rating':undefined}}).then(function(response){if(_this3.format!==format||_this3.user!==user)return;_this3.parseResponse(response,true);_this3.forceUpdate();})["catch"](function(error){if(_this3.format!==''||_this3.user!=='')return;_this3.resultError=''+error;_this3.forceUpdate();});};_proto.modLink=function modLink(overrides){var newPage=overrides.page!==undefined?this.page+overrides.page:1;return PSRouter.href('?'+Net.encodeQuery({user:this.user||undefined,format:this.format||undefined,"private":this.isPrivate?'1':undefined,page:newPage===1?undefined:newPage,sort:(overrides.sort?overrides.sort==='rating':this.byRating)?'rating':undefined}));};_proto.recent=function recent(){var _this4=this;this.format='';this.user='';this.results=null;this.forceUpdate();Net("/api/replays/recent").get().then(function(response){if(_this4.format!==''||_this4.user!=='')return;_this4.parseResponse(response,true);_this4.forceUpdate();})["catch"](function(error){if(_this4.format!==''||_this4.user!=='')return;_this4.resultError=''+error;_this4.forceUpdate();});};_proto.
url=function url(replay){
var viewpointSwitched=toID(replay.players[1])===toID(this.user);
return replay.id+(replay.password?"-"+replay.password+"pw":'')+(viewpointSwitched?'?p2':'');
};_proto.
formatid=function formatid(replay){
var formatid=replay.format;
if(!formatid.startsWith('gen')||!/[0-9]/.test(formatid.charAt(3))){


formatid=(replay.uploadtime>1381734000?'gen6':'gen5')+formatid;
}
if(!/^gen[0-9]+-/.test(formatid)){
formatid=formatid.slice(0,4)+'-'+formatid.slice(4);
}
return formatid;
};_proto.
render=function render(){var _this$results,_this5=this,_this$results2;
var activelySearching=!!(this.format||this.user);
var hasNextPageLink=(((_this$results=this.results)==null?void 0:_this$results.length)||0)>50;
var results=hasNextPageLink?this.results.slice(0,50):this.results;
var searchResults=preact.h("ul",{"class":"linklist"},
this.resultError&&preact.h("li",null,
preact.h("strong",{"class":"message-error"},this.resultError)
)||
!results&&preact.h("li",null,
preact.h("em",null,"Loading...")
)||(
results==null?void 0:results.map(function(result){return preact.h("li",null,
preact.h(ReplayLink,{replay:result,user:toID(_this5.user)})
);}))
);
return preact.h("div",{"class":PSRouter.showingRight()?'sidebar':''},
preact.h("section",{"class":"section first-section"},
preact.h("h1",null,"Search replays"),
preact.h("form",{onSubmit:this.submitForm},
preact.h("p",null,
preact.h("label",null,"Username: ",
preact.h("small",{"class":"gray"},"(separate multiple usernames by commas)"),preact.h("br",null),
preact.h("input",{type:"search","class":"textbox",name:"user",placeholder:"(blank = any user)",size:20})," ",
this.loggedInUser&&
preact.h("button",{type:"button","class":"button",onClick:this.searchLoggedIn},this.loggedInUser,"'s replays")
)
),
preact.h("p",null,
preact.h("label",null,"Format:",preact.h("br",null),
preact.h("input",{type:"search","class":"textbox",name:"format",placeholder:"(blank = any format)",size:30}))
),
preact.h("p",null,
preact.h("label",{"class":"checkbox inline"},preact.h("input",{type:"radio",name:"private",value:""})," Public")," ",
preact.h("label",{"class":"checkbox inline"},preact.h("input",{type:"radio",name:"private",value:"1"})," Private (your own replays only)")
),
preact.h("p",null,
preact.h("button",{type:"submit","class":"button"},preact.h("i",{"class":"fa fa-search","aria-hidden":true})," ",preact.h("strong",null,"Search"))," ",
activelySearching&&preact.h("button",{"class":"button",onClick:this.cancelForm},"Cancel")
),
activelySearching&&preact.h("h1",{"aria-label":"Results"}),
activelySearching&&this.format&&!this.user&&preact.h("p",null,"Sort by: ",

preact.h("a",{href:this.modLink({sort:'date'}),"class":"button button-first"+(this.byRating?'':' disabled')},"Date"

),
preact.h("a",{href:this.modLink({sort:'rating'}),"class":"button button-last"+(this.byRating?' disabled':'')},"Rating"

)
),
activelySearching&&this.page>1&&preact.h("p",{"class":"pagelink"},
preact.h("a",{href:this.modLink({page:-1}),"class":"button"},
preact.h("i",{"class":"fa fa-caret-up","aria-hidden":true}),preact.h("br",null),"Page ",this.page-1
)
),
activelySearching&&searchResults,
activelySearching&&(((_this$results2=this.results)==null?void 0:_this$results2.length)||0)>50&&preact.h("p",{"class":"pagelink"},
preact.h("a",{href:this.modLink({page:1}),"class":"button"},"Page ",
this.page+1,preact.h("br",null),preact.h("i",{"class":"fa fa-caret-down","aria-hidden":true})
)
)
)
),
!activelySearching&&preact.h(FeaturedReplays,null),
!activelySearching&&preact.h("section",{"class":"section"},
preact.h("h1",null,"Recent replays"),
preact.h("ul",{"class":"linklist"},
searchResults
)
)
);
};return SearchPanel;}(preact.Component);var


FeaturedReplays=function(_preact$Component2){function FeaturedReplays(){var _this6;for(var _len2=arguments.length,args=new Array(_len2),_key2=0;_key2<_len2;_key2++){args[_key2]=arguments[_key2];}_this6=_preact$Component2.call.apply(_preact$Component2,[this].concat(args))||this;_this6.
moreFun=false;_this6.
moreCompetitive=false;_this6.
showMoreFun=function(e){
e.preventDefault();
_this6.moreFun=true;
_this6.forceUpdate();
};_this6.
showMoreCompetitive=function(e){
e.preventDefault();
_this6.moreCompetitive=true;
_this6.forceUpdate();
};return _this6;}_inheritsLoose(FeaturedReplays,_preact$Component2);var _proto2=FeaturedReplays.prototype;_proto2.
render=function render(){
return preact.h("section",{"class":"section"},
preact.h("h1",null,"Featured replays"),
preact.h("ul",{"class":"linklist"},
preact.h("li",null,preact.h("h2",null,"Fun")),
preact.h("li",null,preact.h(ReplayLink,{
replay:{id:'oumonotype-82345404',format:'gen6-oumonotype',players:['kdarewolf','Onox']}},
"Protean + prediction"

)),
preact.h("li",null,preact.h(ReplayLink,{
replay:{id:'anythinggoes-218380995',format:'gen6-anythinggoes',players:['Anta2','dscottnew']},switched:true},
"Cheek Pouch"

)),
preact.h("li",null,preact.h(ReplayLink,{
replay:{id:'uberssuspecttest-147833524',format:'gen6-ubers',players:['Metal Brellow','zig100']},switched:true},
"Topsy-Turvy"

)),
!this.moreFun&&preact.h("li",{style:{paddingLeft:'8px'}},
preact.h("button",{"class":"button",onClick:this.showMoreFun},"More ",preact.h("i",{"class":"fa fa-caret-right","aria-hidden":true}))
),
this.moreFun&&preact.h("li",null,preact.h(ReplayLink,{
replay:{id:'smogondoubles-75588440',format:'gen6-smogondoubles',players:['jamace6','DubsWelder']},switched:true},
"Garchomp sweeps 11 pokemon"

)),
this.moreFun&&preact.h("li",null,preact.h(ReplayLink,{
replay:{id:'ou-20651579',format:'gen5-ou',players:['RainSeven07','my body is regi']},switched:true},
"An entire team based on Assist V-create"

)),
this.moreFun&&preact.h("li",null,preact.h(ReplayLink,{
replay:{id:'balancedhackmons7322360',format:'gen5-balancedhackmons',players:['a ver','Shuckie']},switched:true},
"To a ver's frustration, PP stall is viable in Balanced Hackmons"

)),
preact.h("h2",null,"Competitive"),
preact.h("li",null,preact.h(ReplayLink,{
replay:{id:'doublesou-232753081',format:'gen6-doublesou',players:['Electrolyte','finally']}},
"finally steals Electrolyte's spot in the finals of the Doubles Winter Seasonal by outplaying Toxic Aegislash."

)),
preact.h("li",null,preact.h(ReplayLink,{
replay:{id:'smogtours-gen5ou-59402',format:'gen5-ou',players:['Reymedy','Leftiez']}},
"Reymedy's superior grasp over BW OU lead to his claim of victory over Leftiez in the No Johns Tournament."

)),
preact.h("li",null,preact.h(ReplayLink,{
replay:{id:'smogtours-gen3ou-56583',format:'gen3-ou',players:['pokebasket',"Alf'"]}},
"pokebasket proved Blissey isn't really one to take a Focus Punch well in his victory match over Alf' in the Fuck Trappers ADV OU tournament."


)),
preact.h("li",null,preact.h(ReplayLink,{
replay:{id:'smogtours-ou-55891',format:'gen6-ou',players:['Marshall.Law','Malekith']}},
"In a \"match full of reverses\", Marshall.Law takes on Malekith in the finals of It's No Use."

)),
preact.h("li",null,preact.h(ReplayLink,{
replay:{id:'smogtours-ubers-54583',format:'gen6-custom',players:['hard','panamaxis']}},
"Dark horse panamaxis proves his worth as the rightful winner of The Walkthrough Tournament in this exciting final versus hard."


)),
!this.moreCompetitive&&preact.h("li",{style:{paddingLeft:'8px'}},
preact.h("button",{"class":"button",onClick:this.showMoreCompetitive},"More ",preact.h("i",{"class":"fa fa-caret-right","aria-hidden":true}))
),
this.moreCompetitive&&preact.h("li",null,preact.h(ReplayLink,{
replay:{id:'smogtours-ubers-34646',format:'gen6-ubers',players:['steelphoenix','Jibaku']}},
"In this SPL Week 4 battle, Jibaku's clever plays with Mega Sableye keep the momentum mostly in his favor."

)),
this.moreCompetitive&&preact.h("li",null,preact.h(ReplayLink,{
replay:{id:'smogtours-uu-36860',format:'gen6-uu',players:['IronBullet93','Laurel']}},
"Laurel outplays IronBullet's Substitute Tyrantrum with the sly use of a Shuca Berry Cobalion, but luck was inevitably the deciding factor in this SPL Week 6 match."


)),
this.moreCompetitive&&preact.h(ReplayLink,{
replay:{id:'smogtours-gen5ou-36900',format:'gen5-ou',players:['Lowgock','Meridian']}},
"This SPL Week 6 match features impressive plays, from Jirachi sacrificing itself to paralysis to avoid a burn to some clever late-game switches."


),
this.moreCompetitive&&preact.h("li",null,preact.h(ReplayLink,{
replay:{id:'smogtours-gen4ou-36782',format:'gen4-ou',players:['Heist','liberty32']}},
"Starting out as an entry hazard-filled stallfest, this close match is eventually decided by liberty32's efficient use of Aerodactyl."


)),
this.moreCompetitive&&preact.h("li",null,preact.h(ReplayLink,{
replay:{id:'randombattle-213274483',format:'gen6-randombattle',players:['The Immortal','Amphinobite']}},
"Substitute Lugia and Rotom-Fan take advantage of Slowking's utility and large HP stat, respectively, in this high ladder match."


))
)
);
};return FeaturedReplays;}(preact.Component);
//# sourceMappingURL=replays-index.js.map