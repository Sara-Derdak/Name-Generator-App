--TEST--
PHP Spec test generated from ./classes/__gets_return_type.php
--FILE--
<?php

/*
   +-------------------------------------------------------------+
   | Copyright (c) 2014 Facebook, Inc. (http://www.facebook.com) |
   +-------------------------------------------------------------+
*/

error_reporting(-1);

class C {
  public $a = array();


// Try removing the '&' and see how this example behaves differently
//  public function  __get($k) {
  public function & __get($k) {
    echo "__get $k\n";
    return $this->a;
  }
}

$c = new C;
//var_dump($c);
$c->foo[0] = 1;
var_dump($c);

echo "========\n";

$c = new C;
//var_dump($c);
$a =& $c->foo;
$a[0] = 1;
unset($a);
var_dump($c);
--EXPECT--
__get foo
object(C)#1 (1) {
  ["a"]=>
  array(1) {
    [0]=>
    int(1)
  }
}
========
__get foo
object(C)#2 (1) {
  ["a"]=>
  array(1) {
    [0]=>
    int(1)
  }
}
