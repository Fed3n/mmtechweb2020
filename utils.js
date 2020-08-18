function arrCmp(arr1,arr2){
  if(arr1.length != arr2.length) return false;
  for(var i = 0; i < arr1.length; i++){
    if(arr1[i] != arr2[i]) return false;
  }
  return true;
}
//Compara due quest o subquest a seconda dell'attributo number
function questCmp(q1,q2){
  return q1.number-q2.number;
}
//Finds index of arg2 element in arg1 array using comparison function fun
function myIndexOf(arg1, arg2, fun){
  for(var i = 0; i < arg1.length; i++){
    if(fun(arg1[i],arg2)) return i;
  }
  return -1;
}
