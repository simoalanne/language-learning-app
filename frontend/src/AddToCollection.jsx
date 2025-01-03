import { TextField, Button, Chip, Autocomplete } from "@mui/material";
import { useState } from "react";

const AddToCollection = ({
  collection,
  onCollectionChange,
  itemName,
  collectionLimit,
  clearTextFieldRef,
  existingItems, // determines whether to use Autocomplete or TextField
  freeSolo = true, // related to above prop, controls whether to allow adding new items to existingItems
  invalidInputFunction,
}) => {
  const [currentItem, setCurrentItem] = useState("");
  const isLimitReached =
    collectionLimit && collection.length >= collectionLimit;
  const isDisabled =
    currentItem === "" || collection.includes(currentItem) || isLimitReached;

  const buttonLabel = () => {
    if (!collectionLimit) return `+ Add ${itemName} ${collection.length + 1}`;
    if (collection.length >= collectionLimit) return "limit reached";
    return `Add ${itemName} ${collection.length + 1}/${collectionLimit}`;
  };

  const handleInputChange = (newValue) => {
    if (invalidInputFunction && invalidInputFunction(newValue)) {
      return;
    }
    setCurrentItem(newValue || "");
  };

  // returns a function that clears the text field. used for clearing the text field in TranslationCard
  if (clearTextFieldRef) clearTextFieldRef.current = () => setCurrentItem("");

  return (
    <>
      {existingItems?.length > 0 && (
        <Autocomplete
          options={existingItems.filter((item) => !collection.includes(item))}
          value={currentItem}
          onChange={(_, newValue) => handleInputChange(newValue)}
          freeSolo={freeSolo}
          inputValue={currentItem}
          onInputChange={(_, newInputValue) => handleInputChange(newInputValue)}
          renderInput={(params) => (
            <TextField
              {...params}
              label={`Add ${itemName}`}
              fullWidth
              sx={{ mt: 1 }}
            />
          )}
        />
      )}
      {!existingItems?.length && (
        <TextField
          autoComplete="off"
          label={`Add ${itemName}`}
          fullWidth
          value={currentItem}
          onChange={(e) => handleInputChange(e.target.value)}
          sx={{ mt: 1 }}
        />
      )}
      <Button
        variant="contained"
        sx={{ bgcolor: "green", width: "100%", mt: 1 }}
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
          sx={{ mt: 1, mr: 1 }}
        />
      ))}
    </>
  );
};

export default AddToCollection;
