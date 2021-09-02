# ddc-around

Around completion for ddc.vim

This source collects candidates around the cursor, namely inside current
buffer.


## Required

### denops.vim

https://github.com/vim-denops/denops.vim


### ddc.vim

https://github.com/Shougo/ddc.vim


## Configuration

```vim
" Use around source.
call ddc#custom#patch_global('sources', ['around'])

" Change source options
call ddc#custom#patch_global('sourceOptions', {
      \ 'around': {'matchers': ['matcher_head'], 'mark': 'A'},
      \ })
call ddc#custom#patch_global('sourceParams', {
      \ 'around': {'maxSize': 500},
      \ })
```
