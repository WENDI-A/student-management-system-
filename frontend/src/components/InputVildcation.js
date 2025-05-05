  const regx = {
    "letter" : /[a-zA-Z]/g,
    "number" : /[0-9]/g,
    "lowercase" : /[a-z]/g,
    "uppercase" : /[A-Z]/g,
    "phone" : /[0-9]/g,
    id : /[0-9/0-9]/g
  }
  const InputVildcation = (value , type ) => {
    const getRex = regx[type]
   return  value.match(getRex)  ? value.match(getRex).join('') : ""
  }

  export default InputVildcation