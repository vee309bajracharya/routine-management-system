/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback } from "react";

const RoutineEntryContext = createContext({

    // modal state
    isModalOpen: false,
    modalMode: 'create', //create OR update

    //selected cell data
    selectedCell: null,

    // entry data for update mode
    entryToUpdate: null,

    // modal actions
    openCreateModal: () => { },
    openUpdateModal: () => { },
    closeModal: () => { },

    // session state to persist form values per routine
    sessionState: {},
    setSessionState: () => { },
    closeSessionState: () => { },
});

export const RoutineEntryProvider = ({ children }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [selectedCell, setSelectedCell] = useState(null);
    const [entryToUpdate, setEntryToUpdate] = useState(null);
    const [sessionState, setSessionState] = useState({});

    //Open modal in create mode
    const openCreateModal = useCallback((cellData) => {
        setSelectedCell(cellData);
        setModalMode('create');
        setEntryToUpdate(null);
        setIsModalOpen(true);
    }, []);

    //Open modal in update mode
    const openUpdateModal = useCallback((cellData, entry) => {
        setSelectedCell(cellData);
        setModalMode('update');
        setEntryToUpdate(entry);
        setIsModalOpen(true);
    }, []);

    //close modal and reset state
    const closeModal = useCallback(() => {
        setIsModalOpen(false);
    }, []);

    // clear session state for a specific routine
    const clearSessionState = useCallback((routineId) => {
        setSessionState(prev => {
            const updated = { ...prev };
            delete updated[routineId];
            return updated;
        });
    }, []);

    const contextValue = {
        isModalOpen,
        modalMode,
        selectedCell,
        entryToUpdate,
        openCreateModal,
        openUpdateModal,
        closeModal,
        sessionState,
        setSessionState,
        clearSessionState,
    };

    return (
        <RoutineEntryContext.Provider value={contextValue}>
            {children}
        </RoutineEntryContext.Provider>
    )
};

export const useRoutineEntryModal = () => {
    const context = useContext(RoutineEntryContext);
    if (!context)
        throw new Error('useRoutineEntryModal must be used within RoutineEntryProvider');
    return context;
};

export default RoutineEntryContext;