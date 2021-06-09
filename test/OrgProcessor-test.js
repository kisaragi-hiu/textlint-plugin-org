import assert from 'power-assert';
import { TextLintCore } from 'textlint';
import path from 'path';
import TextlintRuleMaxComma from 'textlint-rule-max-comma';

import { parse } from '../src/org-to-ast';
// import { parse } from 'orga';
import OrgPlugin from '../src/index';
// const { orgToPlainText } = OrgPlugin.Processor;

describe('OrgProcessor-test', () => {
  describe('#parse', () => {
    it('should return AST', () => {
      const result = parse(`
This is text.
      `);
      assert(result.type === 'Document');
    });

    it('begin_src should CodeBlock', () => {
      const result = parse(`
#+begin_src
const a = 1;
#+end_src
      `);
      const src = result.children[0];
      assert.equal(src.type, 'CodeBlock');
    });

    it('begin_comment should block', () => {
      const result = parse(`
#+begin_comment
This is comment.
#+end_comment
      `);
      const comment = result.children[0];
      assert.equal(comment.type, 'CodeBlock');
    });

    it('text should Paragraph', () => {
      const result = parse(`
This is text.
      `);
      const text = result.children[0];
      assert.equal(text.type, 'Paragraph');
    });

    it('~~ should text.code', () => {
      const result = parse(`
~const a = 1;~
      `);
      const paragraph = result.children[0];
      const code = paragraph.children[0];
      assert.equal(code.type, 'Code');
    });
  });

  describe('OrgPlugin', () => {
    let textlint;
    context('when target file is a Org', () => {
      beforeEach(() => {
        textlint = new TextLintCore();
        textlint.setupPlugins({
          org: OrgPlugin,
        });
        textlint.setupRules({
          'textlint-rule-max-comma': TextlintRuleMaxComma,
        });
      });

      it('should report lint error', () => {
        const fixturePath = path.join(__dirname, '/fixtures/lint-error.org');
        return textlint.lintFile(fixturePath).then((results) => {
          assert(results.messages.length > 0);
          assert(results.filePath === fixturePath);
        });
      });

      it('should not comma check inside the code block.', () => {
        const fixturePath = path.join(__dirname, '/fixtures/codeblock-test.org');
        return textlint.lintFile(fixturePath).then((results) => {
          assert(results.messages.length === 0);
        });
      });
    });
  });
});
