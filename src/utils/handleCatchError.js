
const catchHandler = (err, type, res) =>{
  console.log(`Error occurred in ${type} controller--> ` + err.message);
  res.status(500).json({
    error: "internal server error",
  });
}

export default catchHandler; 