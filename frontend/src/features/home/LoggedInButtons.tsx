import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlineOutlined";
import {
	Box,
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	Menu,
	MenuItem,
} from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useApiClient } from "../../providers/api-client";
import { useAppAuth } from "../../providers/use-app-auth";

const LoggedInButtons = () => {
	const { displayName, signOut } = useAppAuth();
	const { api } = useApiClient();
	const navigate = useNavigate();
	const location = useLocation();

	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const handleClick = (event: HTMLElement) => {
		setAnchorEl(event);
	};
	const handleClose = () => {
		setAnchorEl(null);
	};
	const deleteAccount = useMutation(
		api.account.remove.mutationOptions({
			onSuccess: async () => {
				setIsDeleteDialogOpen(false);
				if (location.pathname !== "/learn") {
					navigate("/learn");
				}
				await signOut();
			},
		}),
	);

	return (
		<Box sx={{ display: "flex", gap: 2 }}>
			<Button
				variant="contained"
				size="large"
				sx={{
					bgcolor: "#1976D2",
					color: "white",
					borderRadius: 5,
					textTransform: "none",
					fontWeight: "bold",
					px: 2,
				}}
				onClick={(e) => handleClick(e.currentTarget)}
			>
				{displayName}
			</Button>
			<Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
				<MenuItem
					onClick={() => {
						navigate(
							`${
								location.pathname === "/learn"
									? "/manage-translations/add"
									: "/learn"
							}`,
						);
						handleClose();
					}}
					sx={{
						fontWeight: "bold",
					}}
				>
					{location.pathname === "/learn"
						? "Manage Translations"
						: "Learn Words"}
				</MenuItem>
				<MenuItem
					onClick={() => {
						navigate("/ai-translation-generation");
						handleClose();
					}}
					sx={{
						fontWeight: "bold",
					}}
				>
					Generate Translations with AI
				</MenuItem>
				<MenuItem
					onClick={() => {
						if (location.pathname !== "/learn") {
							navigate("/learn");
						}
						signOut();
						handleClose();
					}}
					sx={{
						fontWeight: "bold",
					}}
				>
					Logout
				</MenuItem>
				<MenuItem
					onClick={() => {
						setIsDeleteDialogOpen(true);
						handleClose();
					}}
					sx={{
						color: "error.main",
						fontWeight: "bold",
						gap: 1,
					}}
				>
					<DeleteOutlineIcon fontSize="small" />
					Delete account
				</MenuItem>
			</Menu>
			<Dialog
				open={isDeleteDialogOpen}
				onClose={() => setIsDeleteDialogOpen(false)}
				aria-labelledby="delete-account-dialog-title"
			>
				<DialogTitle id="delete-account-dialog-title">
					Delete account?
				</DialogTitle>
				<DialogContent>
					<DialogContentText>
						This permanently deletes your account and saved translations.
					</DialogContentText>
					{deleteAccount.isError ? (
						<DialogContentText color="error" sx={{ mt: 2 }}>
							Account deletion failed. Please try again.
						</DialogContentText>
					) : null}
				</DialogContent>
				<DialogActions>
					<Button
						onClick={() => setIsDeleteDialogOpen(false)}
						disabled={deleteAccount.isPending}
					>
						Cancel
					</Button>
					<Button
						color="error"
						variant="contained"
						onClick={() => deleteAccount.mutate(undefined)}
						disabled={deleteAccount.isPending}
					>
						Delete
					</Button>
				</DialogActions>
			</Dialog>
		</Box>
	);
};

export default LoggedInButtons;
