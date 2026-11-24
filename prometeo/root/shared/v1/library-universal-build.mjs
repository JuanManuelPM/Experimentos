// Presentation-only transformation. No writes unless explicitly invoked by a future operator.
import {readFileSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
export function applySkin(source,mode,version='1'){
 if(!['3d','gallery'].includes(mode)||!source.includes('</head>')||!source.includes('<body>')||source.includes('data-library='))throw Error('Unexpected or already skinned HTML; inspect current owner source');
 const shared=mode==='3d'?'../../root/shared/v1/library-universal':'../shared/v1/library-universal';
 const engine=mode==='3d'?'studio.js':'gallery.mjs';
 if(!source.includes(engine))throw Error('Original engine missing');
 let result=source.replace('</head>', '<link rel="stylesheet" href="'+shared+'.css?v='+version+'"><script defer src="'+shared+'.js?v='+version+'"></script></head>').replace('<body>','<body class="u-library" data-library="'+mode+'"><aside class="u-rail" id="u-rail" aria-label="Navegación"></aside>');
 if(mode==='3d'){if(!result.includes('<header class="top">'))throw Error('Original 3D header changed');result=result.replace('<header class="top">','<header class="top" hidden>')}
 return result;
}
if(process.argv[1]&&resolve(process.argv[1])===new URL(import.meta.url).pathname){
 const [mode,input,output,version='1']=process.argv.slice(2);
 if(!input||!output||resolve(input)===resolve(output))throw Error('Usage: node library-universal-build.mjs 3d|gallery source.html candidate.html [version]; no in-place writes');
 writeFileSync(output,applySkin(readFileSync(input,'utf8'),mode,version),{flag:'wx'});
}
