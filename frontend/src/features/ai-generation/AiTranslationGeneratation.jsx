import { useState } from "react";
import ContentAligner from "../../components/ContentAligner";
import ToastMessage from "../../components/ToastMessage";
import GeneratedWordsDisplay from "./GeneratedWordsDisplay";
import useAiWordGeneration from "./useAiWordGeneration";
import WordGenerationForm from "./WordGenerationForm";

const AiTranslationGeneratation = () => {
  const {
    form,
    formConfig,
    handleWordGenerationFormChange,
    handleWordGenerationFormSubmit,
    generatedWords,
    handleSaveWordsToDatabase,
    handleWordItemSelectChange,
    handleWordItemTranslationChange,
    loading,
  } = useAiWordGeneration();

  const [snackbarMessage, setSnackbarMessage] = useState("");

  const handleSave = async () => {
    try {
      await handleSaveWordsToDatabase();
      setSnackbarMessage("Words saved successfully!");
    } catch (error) {
      console.error("Saving words failed:", error);
      setSnackbarMessage("Failed to save words. Please try again!");
    }
  };

  return (
    <ContentAligner background="url(/style1.png)" centerVertically={false} sx={{ pt: 4 }}>
      {generatedWords.length === 0 ? (
        <WordGenerationForm
          form={form}
          formConfig={formConfig}
          onChange={handleWordGenerationFormChange}
          onSubmit={handleWordGenerationFormSubmit}
          loading={loading}
        />
      ) : (
        <GeneratedWordsDisplay
          words={generatedWords}
          form={form}
          onFormChange={handleWordGenerationFormChange}
          onSelect={handleWordItemSelectChange}
          onChangeTranslation={handleWordItemTranslationChange}
          onSave={handleSave}
          loading={loading}
        />
      )}
      <ToastMessage
        open={snackbarMessage !== ""}
        message={snackbarMessage}
        onClose={() => setSnackbarMessage("")}
        severity="success"
      />
    </ContentAligner>
  );
};

export default AiTranslationGeneratation;
