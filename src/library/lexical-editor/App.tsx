"use client"
/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import * as React from 'react';
import './index.css';
import { $createParagraphNode, $createTextNode, EditorState, LexicalEditor } from 'lexical';
import {$getRoot, $getSelection} from 'lexical';
import { $generateHtmlFromNodes } from '@lexical/html';
import {LexicalComposer} from '@lexical/react/LexicalComposer';

import {FlashMessageContext} from './context/FlashMessageContext';
import {SettingsContext} from './context/SettingsContext';
import {SharedAutocompleteContext} from './context/SharedAutocompleteContext';
import {SharedHistoryContext} from './context/SharedHistoryContext';
import Editor from './Editor';

import PlaygroundNodes from './nodes/PlaygroundNodes';
import {TableContext} from './plugins/TablePlugin';
import PlaygroundEditorTheme from './themes/PlaygroundEditorTheme';

interface Props{
  value?: string;
  onChange?: (value: string, html: string) => void;
}

export default function App({value, onChange}: Props): JSX.Element {

  const parsedJson = JSON.parse(value||'{"root":{"children":[]}}');

  // Recursive function to create nodes from JSON
  const createNode = (node: any) => {
    switch (node.type) {
      case 'paragraph':
        const paragraphNode = $createParagraphNode();
        node.children.forEach((child: any) => {
          paragraphNode.append(createNode(child));
        });
        return paragraphNode;
      case 'text':
        return $createTextNode(node.text);
      default:
        throw new Error(`Unknown node type: ${node.type}`);
    }
  }
  
  // Function to set the editor state
  const  setEditorStateFromJson = ()  => {
    const root = $getRoot();
    root.clear(); // Clear existing content
    parsedJson?.root?.children?.forEach((child: any) => {
      root.append(createNode(child));
    });
  }

  const initialConfig = {
    editorState: setEditorStateFromJson,
    namespace: 'Playground',
    nodes: [...PlaygroundNodes],
    onError: (error: Error) => {
      throw error;
    },
    theme: PlaygroundEditorTheme,
  };

  const handleChange = (editorState: EditorState, editor: LexicalEditor) => {
    editorState.read(() => {
      const jsonString = JSON.stringify(editorState);
      const htmlString = $generateHtmlFromNodes(editor);
      onChange?.(jsonString, htmlString);
    });
  }

  return (
    <SettingsContext>
      <FlashMessageContext>
        <LexicalComposer initialConfig={initialConfig}>
          <SharedHistoryContext>
            <TableContext>
              <SharedAutocompleteContext>
                <div className="editor-shell">
                  <Editor onChange={handleChange} />
                </div>
              </SharedAutocompleteContext>
            </TableContext>
          </SharedHistoryContext>
        </LexicalComposer>
      </FlashMessageContext>
    </SettingsContext>
  );
}
