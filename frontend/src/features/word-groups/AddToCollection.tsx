import { Autocomplete, Button, Chip, TextField } from "@mui/material";
import { type MutableRefObject, useState } from "react";

type AddToCollectionProps = {
	collection: string[];
	onCollectionChange: (collection: string[]) => void;
	itemName: string;
	collectionLimit?: number;
	clearTextFieldRef?: MutableRefObject<(() => void) | null>;
	existingItems?: string[];
	freeSolo?: boolean;
	invalidInputFunction?: (value: string) => boolean;
};

const AddToCollection = ({
	collection,
	onCollectionChange,
	itemName,
	collectionLimit,
	clearTextFieldRef,
	existingItems, // determines whether to use Autocomplete or TextField
	freeSolo = true, // related to above prop, controls whether to allow adding new items to existingItems
	invalidInputFunction,
}: AddToCollectionProps) => {
	const [currentItem, setCurrentItem] = useState("");
	const isLimitReached = Boolean(
		collectionLimit && collection.length >= collectionLimit,
	);
	const isDisabled =
		currentItem === "" || collection.includes(currentItem) || isLimitReached;
	const hasExistingItems = (existingItems?.length ?? 0) > 0;

	const buttonLabel = () => {
		if (!collectionLimit) return `+ Add ${itemName} ${collection.length + 1}`;
		if (collection.length >= collectionLimit) return "limit reached";
		return `Add ${itemName} ${collection.length + 1}/${collectionLimit}`;
	};

	const handleInputChange = (newValue: string | null) => {
		const nextValue = newValue ?? "";
		if (invalidInputFunction && invalidInputFunction(nextValue)) {
			return;
		}
		setCurrentItem(nextValue);
	};

	// returns a function that clears the text field. used for clearing the text field in TranslationCard
	if (clearTextFieldRef) clearTextFieldRef.current = () => setCurrentItem("");

	return (
		<>
			{hasExistingItems && (
				<Autocomplete
					options={existingItems!.filter((item) => !collection.includes(item))}
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
			{!hasExistingItems && (
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
					sx={{ mt: 1, mr: 1, bgcolor: "primary.main", color: "white" }}
				/>
			))}
		</>
	);
};

export default AddToCollection;
