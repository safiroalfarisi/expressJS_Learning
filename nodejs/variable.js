//variables (let,const, var)
let name = 'shiro';
const version = 10;

//function declaration
function greet(name){
    return `Hello, ${name}!`; //template literal (ES6)
}

// Arrow function (ES6+)
const add = (a, b) => a+b;

console.log(greet(name));
console.log(add(7, 8));
console.log('-------------------------------------------')

// Object & Array

//Object
const user ={
    name: 'shiro',
    age: 20,
    greet(){
        console.log(`Hello, I am ${this.name}`);
    }
};

//Array
const animal = ['cat', 'dog', 'fish'];

// Array methods
animal.push('bird'); //add element
console.log(animal);
animal.forEach((item) => console.log(item)); //iterate array
const lengths = animal.map(item => item.length); //map method
console.log(lengths);
console.log(greet(name));