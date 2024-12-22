import { TextField, Button, Chip } from "@mui/material";
import { useState } from "react";

const AddToCollection = ({ collection, onCollectionChange, itemName }) => {
  const [currentItem, setCurrentItem] = useState("");

  return (
    <>
      <TextField
        label={`Add ${itemName} ${collection.length + 1}`}
        fullWidth
        value={currentItem}
        onChange={(e) => setCurrentItem(e.target.value)}
      />
      <Button
        variant="contained"
        color="primary"
        fullWidth
        onClick={() => {
          onCollectionChange([...collection, currentItem]);
          setCurrentItem("");
        }}
        style={{ marginTop: "10px" }}
        disabled={currentItem === "" || collection.includes(currentItem)}
      >
        {`Add ${itemName}`}
      </Button>
      {collection.map((item, i) => (
        <Chip
          key={i}
          label={item}
          onDelete={() =>
            onCollectionChange(collection.filter((_, index) => index !== i))
          }
          style={{ marginTop: "10px", marginRight: "10px" }}
        />
      ))}
    </>
  );
};

export default AddToCollection;
