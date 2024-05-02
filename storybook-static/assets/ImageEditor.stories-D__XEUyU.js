import{j as s}from"./jsx-runtime-QvZ8i92b.js";import{r as i}from"./index-uubelm5h.js";function Y({onSuccess:r,stabilityApiKey:g}={stabilityApiKey:""}){const[a,c]=i.useState(!1),[l,E]=i.useState(null),[L,C]=i.useState(null),[N,b]=i.useState(null);return{inpaint:async(d,m,B)=>{c(!0);const j=new FormData,k=document.createElement("canvas");k.width=m.width,k.height=m.height;const f=k.getContext("2d");if(!f)return;f.drawImage(m,0,0);const M=await(await fetch(d)).blob();if(j.append("image",M),!f)throw new Error("Failed to get canvas context");const p=f.getImageData(0,0,m.width,m.height);for(let o=0;o<p.data.length;o+=4)p.data[o+3]!==0?(p.data[o]=255,p.data[o+1]=255,p.data[o+2]=255,p.data[o+3]=255):(p.data[o]=0,p.data[o+1]=0,p.data[o+2]=0,p.data[o+3]=255);f.putImageData(p,0,0),k.toBlob(async o=>{if(!o)return;b(URL.createObjectURL(o)),j.append("mask",o,"mask.png"),j.append("prompt",B),j.append("output_format","webp");const I=await fetch("https://api.stability.ai/v2beta/stable-image/edit/inpaint",{method:"POST",headers:{Authorization:`Bearer ${g}`,Accept:"image/*"},body:j}).then(w=>{if(w.ok)return w.blob();throw new Error("Network response was not ok.")}).then(w=>{const D=URL.createObjectURL(w);C(D),r&&r(D)}).catch(w=>{c(!1),E(w)});return c(!1),I})},data:L,mask:N,loading:a,error:l}}function Z(r){const[g,a]=i.useState(r),[c,l]=i.useState([]),E=h=>{h instanceof Function?a(d=>h(d)):(a(d=>[...d,h]),l([]))},L=()=>{l(h=>{const d=h[h.length-1];return a(m=>[...m,d]),c.slice(0,-1)})},C=()=>{console.log("undo"),a(h=>{const d=h[h.length-1];return l(m=>[...m,d]),h.slice(0,g.length-1)})},N=()=>{a(r),l([])},b=()=>{a([]),l([])};return console.log(g),{commands:g,addCommand:E,redo:L,undo:C,reset:N,clear:b}}function q(...r){return r.filter(Boolean).join(" ")}function v({children:r,className:g,selected:a,...c}){const l=q("w-12 h-12 bg-gray-100 rounded p-4 flex justify-center items-center",a&&"bg-blue-100",g);return s.jsx("button",{...c,className:l,children:r})}v.__docgenInfo={description:"",methods:[],displayName:"Button",props:{children:{required:!0,tsType:{name:"ReactReactNode",raw:"React.ReactNode"},description:""},className:{required:!1,tsType:{name:"string"},description:""},selected:{required:!1,tsType:{name:"boolean"},description:""}},composes:["ComponentProps"]};function P({src:r,stabilityApiKey:g}){return s.jsx(K,{src:r,stabilityApiKey:g})}const G=20;function O(r){return r.type==="inpaint"}function X(r){return r.findLast(O)}function K({src:r,stabilityApiKey:g}){var D;const a=i.useRef(null),{commands:c,addCommand:l,undo:E,redo:L}=Z([]),[C,N]=i.useState(null),[b,h]=i.useState(G),[d,m]=i.useState("brush"),[B,j]=i.useState(""),k=Y({stabilityApiKey:g,onSuccess:t=>{l({type:"inpaint",data:t}),l({type:"clear"})}}),f=k.loading,W=((D=X(c))==null?void 0:D.data)||r,M=i.useCallback(()=>{var u;const t=a.current,n=(u=a==null?void 0:a.current)==null?void 0:u.getContext("2d");if(!t||!n)return;t.getContext("2d");const e=window.devicePixelRatio,x=Math.floor(t.clientWidth*e),y=Math.floor(t.clientHeight*e);return t.width!==x||t.height!==y?(t.width=x,t.height=y,n.scale(e,e),!0):!1},[a,C]);i.useEffect(()=>{M()},[M,C]),i.useEffect(()=>{const t=a.current;if(!t)return;const n=t.getContext("2d");if(!n)return;const e=new Image;e.onload=()=>{n.clearRect(0,0,t.width,t.height),N(e)},e.src=r},[r]);const p=t=>{f||l({type:"draw",steps:[{type:"start",x:t.nativeEvent.offsetX,y:t.nativeEvent.offsetY,color:"black",lineWidth:b,brushType:d}]})},o=t=>{if(f)return;const{offsetX:n,offsetY:e}=t.nativeEvent,x=c[c.length-1];if(!x||x.type==="inpaint")return;const y=x.steps[x.steps.length-1];if(!y||y.type==="end")return;const{x:u,y:U}=y,_=Math.sqrt(Math.pow(n-u,2)+Math.pow(e-U,2)),F=Math.max(b,b*5-_/10);l(S=>{const H=S[S.length-1];return H.type!=="draw"?S:[...S.slice(0,S.length-1),{...H,steps:[...H.steps,{type:"draw",x:n,y:e,lineWidth:F,brushType:d}]}]})},I=t=>{f||l(n=>{const e=n[n.length-1];return!e||e.type!=="draw"?n:e!=null&&e.steps.length&&e.steps[e.steps.length-1].type!=="end"?[...n.slice(0,n.length-1),{...e,steps:[...e.steps,{type:"end"}]}]:n})},w=i.useCallback(t=>{const n=a.current,e=n==null?void 0:n.getContext("2d");if(!n||!e||!C)return;e.clearRect(0,0,n==null?void 0:n.width,n==null?void 0:n.height);let x=!1;for(const y of t)switch(y.type){case"draw":for(const u of y.steps)switch(u.type){case"start":e.globalCompositeOperation=u.brushType==="eraser"?"destination-out":"source-over",e.lineCap="round",e.lineJoin="round",e.lineWidth=u.lineWidth,e.strokeStyle=u.color,e.beginPath(),e.moveTo(u.x,u.y),x=!0;break;case"draw":x&&(e.lineWidth=u.lineWidth,e.lineTo(u.x,u.y),e.stroke());break;case"end":e.closePath(),x=!1;break}break;case"clear":e.clearRect(0,0,n.width,n.height);break}},[a,C]);return i.useEffect(()=>{w(c)},[c,w]),i.useEffect(()=>{const t=()=>{M(),w(c)};return window.addEventListener("resize",t),()=>{window.removeEventListener("resize",t)}},[c,w,M]),s.jsxs("div",{children:[s.jsxs("div",{className:"flex gap-2 mb-2",children:[s.jsx(v,{onClick:()=>m("brush"),selected:d==="brush",children:s.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",strokeWidth:1.5,stroke:"currentColor",className:"w-6 h-6",children:s.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M9.53 16.122a3 3 0 0 0-5.78 1.128 2.25 2.25 0 0 1-2.4 2.245 4.5 4.5 0 0 0 8.4-2.245c0-.399-.078-.78-.22-1.128Zm0 0a15.998 15.998 0 0 0 3.388-1.62m-5.043-.025a15.994 15.994 0 0 1 1.622-3.395m3.42 3.42a15.995 15.995 0 0 0 4.764-4.648l3.876-5.814a1.151 1.151 0 0 0-1.597-1.597L14.146 6.32a15.996 15.996 0 0 0-4.649 4.763m3.42 3.42a6.776 6.776 0 0 0-3.42-3.42"})})}),s.jsx(v,{onClick:()=>m("eraser"),selected:d==="eraser",children:s.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 576 512",children:s.jsx("path",{d:"M290.7 57.4L57.4 290.7c-25 25-25 65.5 0 90.5l80 80c12 12 28.3 18.7 45.3 18.7H288h9.4H512c17.7 0 32-14.3 32-32s-14.3-32-32-32H387.9L518.6 285.3c25-25 25-65.5 0-90.5L381.3 57.4c-25-25-65.5-25-90.5 0zM297.4 416H288l-105.4 0-80-80L227.3 211.3 364.7 348.7 297.4 416z"})})}),s.jsx(v,{onClick:E,children:s.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",strokeWidth:1.5,stroke:"currentColor",className:"w-6 h-6",children:s.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3"})})}),s.jsx(v,{onClick:L,children:s.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",strokeWidth:1.5,stroke:"currentColor",className:"w-6 h-6",children:s.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"m15 15 6-6m0 0-6-6m6 6H9a6 6 0 0 0 0 12h3"})})}),s.jsxs("div",{children:[s.jsxs("label",{htmlFor:"default-range",className:"block text-sm font-medium text-gray-900",children:["Brush Size (",b,")"]}),s.jsx("input",{id:"default-range",type:"range",name:"brushSize",min:"1",max:"100",onChange:t=>h(Number(t.target.value)),value:b,className:"w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"})]}),s.jsx("input",{type:"text",placeholder:"Enter prompt",className:"border-black border rounded p-2",value:B,onChange:t=>j(t.target.value)}),s.jsx(v,{className:"w-20",disabled:f,onClick:()=>{a.current&&k.inpaint(W,a.current,B)},children:f?s.jsxs("svg",{"aria-hidden":"true",className:"w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600",viewBox:"0 0 100 101",fill:"none",xmlns:"http://www.w3.org/2000/svg",children:[s.jsx("path",{d:"M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z",fill:"currentColor"}),s.jsx("path",{d:"M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z",fill:"currentFill"})]}):"Inpaint"})]}),s.jsxs("div",{className:"relative w-full",children:[s.jsx("canvas",{className:q(f&&"animate-pulse","bg-transparent absolute top-0 left-0 right-0 bottom-0 w-full h-full"),ref:a,onMouseDown:p,onMouseMove:o,onMouseUp:I,onMouseOut:I,style:{display:"block",cursor:"crosshair"}}),s.jsx("img",{src:W,alt:"your image",className:"w-full"})]})]})}P.__docgenInfo={description:"",methods:[],displayName:"AIEdit",props:{src:{required:!0,tsType:{name:"string"},description:""},stabilityApiKey:{required:!0,tsType:{name:"string"},description:""}}};const $={title:"Example/ImageEditor",component:P,tags:["autodocs"]},R={args:{src:"https://images.unsplash.com/photo-1499561385668-5ebdb06a79bc?q=80&w=2969&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"}};var z,T,A;R.parameters={...R.parameters,docs:{...(z=R.parameters)==null?void 0:z.docs,source:{originalSource:`{
  args: {
    src: "https://images.unsplash.com/photo-1499561385668-5ebdb06a79bc?q=80&w=2969&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
  }
}`,...(A=(T=R.parameters)==null?void 0:T.docs)==null?void 0:A.source}}};const Q=["Primary"];export{R as Primary,Q as __namedExportsOrder,$ as default};
