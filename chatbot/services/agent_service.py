from dependency_injector.wiring import inject, Provide
from modules.agent.agent import create_root_agent
from modules.agent.extracted_info import (
    create_extracted_info_agent,
    create_search_agent,
)


class AgentService:
    """Service để quản lý và tạo các agent instances"""

    def __init__(self, config: dict):
        self.config = config
        self._root_agent = None
        self._extracted_info_agent = None
        self._search_agent = None

    def get_root_agent(self):
        """Lazy loading root agent"""
        if self._root_agent is None:
            self._root_agent = create_root_agent(self.config)
        return self._root_agent

    def get_extracted_info_agent(self):
        """Lazy loading extracted info agent"""
        if self._extracted_info_agent is None:
            self._extracted_info_agent = create_extracted_info_agent(self.config)
        return self._extracted_info_agent

    def get_search_agent(self):
        """Lazy loading search agent"""
        if self._search_agent is None:
            self._search_agent = create_search_agent(self.config)
        return self._search_agent

    def reset_agents(self):
        """Reset all agents (useful for config changes)"""
        self._root_agent = None
        self._extracted_info_agent = None
        self._search_agent = None
