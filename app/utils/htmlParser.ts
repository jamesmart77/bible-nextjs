import {
    attributesToProps,
    domToReact,
    type DOMNode,
    Element,
    type HTMLReactParserOptions,
} from 'html-react-parser';
import React from 'react';
import Audio from '../components/passages/Audio';

const transformAudio = (node: Element) => {
    const { attribs, prev } = node;

    if (attribs?.class?.includes('audio')) {
        // const passageRef = prev.data.trim().replaceAll(' ', '+');
        return React.createElement(Audio, {});
        // return React.createElement(Audio, { key: `passage-${passageRef}` });
    }

    return node;
}

// const transformCrossRef = (node) => {
//     if (node.name === 'sup' && node.attribs.class === undefined && 
//         node.children.length === 1 && node.children[0].attribs && 
//         node.children[0].attribs.href
//     ) {
//         const passageRefs = node.children[0].attribs.href.replaceAll('/', '');
//         return <CrossRef key={`crossref-${passageRefs}`} passageRefs={passageRefs} />
//     }
// }

export const updateHtml = (node: Element) => {
    let updatedNode = transformAudio(node);
    
    // only look to transform if new line not found 
    // if (updatedNode === node) updatedNode = transformCrossRef(node);
    
    return updatedNode;
}

export const replaceEsvHtmlNode: NonNullable<HTMLReactParserOptions['replace']> = (
    domNode,
    index
) => {
    if (!(domNode instanceof Element)) return;

    if (domNode.name === 'note') {
        return React.createElement(
            'span',
            {
                ...attributesToProps(domNode.attribs),
                key: index,
                role: domNode.attribs.role ?? 'note',
            },
            domToReact(domNode.children as DOMNode[], {
                replace: replaceEsvHtmlNode,
            })
        );
    }

    const updatedNode = updateHtml(domNode);
    if (updatedNode !== domNode) return updatedNode;
}
