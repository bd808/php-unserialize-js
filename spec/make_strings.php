<?php

function dump ($o) {
  $o = serialize($o);
  echo json_encode($o), "\n";
}

class Foo {
  public $bar = 1;
  protected $baz = 2;
  private $xyzzy = array(1,2,3,4,5,6,7,8,9);
  protected $self;
  public function __construct () {
    $this->self = $this;
  }
}
$f = new Foo();
dump($f);

class Bar {
}
$f = new Bar();
$f->self = $f;
dump($f);

$f = new stdClass;
$f->obj1->obj2->obj3->arr = array();
$f->obj1->obj2->obj3->arr[] = 1;
$f->obj1->obj2->obj3->arr[] = 2;
$f->obj1->obj2->obj3->arr[] = 3;
$f->obj1->obj2->obj3->arr['ref1'] = $f->obj1->obj2;
$f->obj1->obj2->obj3->arr['ref2'] = &$f->obj1->obj2->obj3->arr;
dump($f);
