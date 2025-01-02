import { TextField, Button, Chip } from "@mui/material";
import { useState } from "react";

const AddToCollection = ({ collection, onCollectionChange, itemName, collectionLimit, clearTextFieldRef }) => {
  const [currentItem, setCurrentItem] = useState("");
  const isLimitReached = collectionLimit && collection.length >= collectionLimit;
  const isDisabled = currentItem === "" || collection.includes(currentItem) || isLimitReached;

  const buttonLabel = () => {
    if (!collectionLimit) return `+ Add ${itemName} ${collection.length + 1}`;
    if (collection.length >= collectionLimit) return "limit reached";
    return `Add ${itemName} ${collection.length + 1}/${collectionLimit}`;
  };

  // returns a function that clears the text field. used for clearing the text field in TranslationCard
  if (clearTextFieldRef) clearTextFieldRef.current = () => setCurrentItem("");

  return (
    <>
      <TextField
        label={`Add ${itemName}`}
        fullWidth
        value={currentItem}
        onChange={(e) => setCurrentItem(e.target.value)}
        sx={{mt: 1 }}
      />
      <Button
        variant="contained"
        sx={{bgcolor: "green", width: "100%", mt: 1 }}
        fullWidth
        onClick={() => {
          onCollectionChange([...collection, currentItem]);
          setCurrentItem("");
        }}
        disabled={isDisabled}
      >
        {buttonLabel()}
      </Button>
      {collection.map((item, i) => (
        <Chip
          key={i}
          label={item}
          onDelete={() =>
            onCollectionChange(collection.filter((_, index) => index !== i))
          }
          sx={{mt: 1, mr: 1 }}
        />
      ))}
    </>
  );
};

export default AddToCollection;
