## Change Log

List of changes in descending order.

### (BREAKING CHANGES) 10.06.2018 (v1.2.0)

Refactor of Tablur better handling of ansi styling within table content. Better padding support. 
Simplified API. Removed .header() and .footer() in favor of just using .section() or .row() in order.

<table>
  <tr><td>Version 1.2</td><td>Push new minor version.</td></tr>
</table>

### 07.15.2018 (v1.0.8)

<table>
  <tr><td>.buildRow()</td><td>internal method should not override user defined "align".</td></tr>
  <tr><td>.header()</td><td>update code help/examples for .header() method.</td></tr>
</table>

### 06.14.2018 (v1.0.3-1.0.5)

<table>
  <tr><td>.row()</td><td>when no columns length ignore.</td></tr>
  <tr><td>borders</td><td>fix issue where undesired caps show if no header/footer.</td></tr>
  <tr><td>aligns</td><td>add option where array of global alignments can be passed.</td></tr>
</table>

### 06.13.2018 (v1.0.1-1.0.2)

<table>
  <tr><td>size</td><td>fix issue with size getter.</td></tr>
  <tr><td>initial</td><td>initial commit</td></tr>
</table>